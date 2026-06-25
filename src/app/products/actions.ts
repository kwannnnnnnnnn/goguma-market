"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  isProductStatus,
  MAX_IMAGES,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/products";
import type { Database } from "@/lib/supabase/database.types";

export type ProductFormState = {
  error?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 사진 한 장당 5MB 제한

// 폼에서 보낸 글자 값(제목/가격/설명/상태)을 읽고 검사하는 공통 함수
function parseProductForm(formData: FormData):
  | { ok: true; values: { title: string; price: number; description: string; status: string } }
  | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").replace(/,/g, "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "selling").trim();

  if (!title) {
    return { ok: false, error: "제목을 입력해 주세요." };
  }
  if (title.length > 100) {
    return { ok: false, error: "제목은 100자 이내로 입력해 주세요." };
  }

  const price = Number(priceRaw);
  if (!priceRaw || !Number.isInteger(price) || price < 0) {
    return { ok: false, error: "가격은 0 이상의 숫자로 입력해 주세요." };
  }

  if (!isProductStatus(status)) {
    return { ok: false, error: "판매 상태 값이 올바르지 않아요." };
  }

  return { ok: true, values: { title, price, description, status } };
}

// 폼에서 보낸 사진 파일들을 골라냅니다. (빈 파일 입력은 크기 0 이라 걸러냅니다.)
function pickImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((v): v is File => v instanceof File && v.size > 0);
}

// 사진들을 창고(Storage)에 올리고, 저장된 경로 목록을 돌려줍니다.
async function uploadImages(
  supabase: SupabaseClient<Database>,
  userId: string,
  files: File[],
): Promise<{ ok: true; paths: string[] } | { ok: false; error: string }> {
  const uploaded: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploaded);
      return { ok: false, error: "이미지 파일만 올릴 수 있어요." };
    }
    if (file.size > MAX_FILE_SIZE) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploaded);
      return { ok: false, error: "사진은 한 장당 5MB 이하로 올려주세요." };
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type });

    if (error) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploaded);
      return { ok: false, error: "사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요." };
    }
    uploaded.push(path);
  }

  return { ok: true, paths: uploaded };
}

// 판매글 등록 (Create)
export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const files = pickImageFiles(formData);
  if (files.length > MAX_IMAGES) {
    return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.` };
  }

  const uploadResult = await uploadImages(supabase, user.id, files);
  if (!uploadResult.ok) {
    return { error: uploadResult.error };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ ...parsed.values, seller_id: user.id, image_paths: uploadResult.paths })
    .select("id")
    .single();

  if (error) {
    // 글 저장이 실패하면 방금 올린 사진은 창고에서 다시 지웁니다.
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploadResult.paths);
    return { error: "판매글을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath("/products");
  redirect(`/products/${data.id}`);
}

// 판매글 수정 (Update)
export async function updateProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  // 기존 사진 중 "삭제 체크"가 된 것을 빼고 남길 사진을 계산합니다.
  const existing = formData.getAll("existing_images").map(String);
  const toRemove = formData.getAll("remove_images").map(String);
  const kept = existing.filter((p) => !toRemove.includes(p));

  const files = pickImageFiles(formData);
  if (kept.length + files.length > MAX_IMAGES) {
    return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.` };
  }

  const uploadResult = await uploadImages(supabase, user.id, files);
  if (!uploadResult.ok) {
    return { error: uploadResult.error };
  }

  const finalPaths = [...kept, ...uploadResult.paths];

  // RLS 가 본인 글만 수정되게 막아주지만, seller_id 조건도 함께 겁니다.
  const { error } = await supabase
    .from("products")
    .update({ ...parsed.values, image_paths: finalPaths })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploadResult.paths);
    return { error: "판매글을 수정하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  // 글에서 빠진 사진은 창고에서도 정리합니다. (실패해도 진행)
  if (toRemove.length > 0) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(toRemove);
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

// 판매글 삭제 (Delete)
export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 글에 달린 사진 경로를 먼저 읽어둡니다. (글이 지워지기 전에)
  const { data: product } = await supabase
    .from("products")
    .select("image_paths")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  await supabase.from("products").delete().eq("id", id).eq("seller_id", user.id);

  // 창고에 남은 사진들도 함께 정리합니다.
  if (product?.image_paths?.length) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(product.image_paths);
  }

  revalidatePath("/products");
  redirect("/products");
}
