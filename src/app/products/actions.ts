"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isProductStatus } from "@/lib/products";

export type ProductFormState = {
  error?: string;
};

// 폼에서 보낸 값을 읽고 검사하는 공통 함수
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

  const { data, error } = await supabase
    .from("products")
    .insert({ ...parsed.values, seller_id: user.id })
    .select("id")
    .single();

  if (error) {
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

  // RLS 규칙이 본인 글만 수정되도록 한 번 더 막아주지만,
  // 안전하게 seller_id 조건도 함께 겁니다.
  const { error } = await supabase
    .from("products")
    .update(parsed.values)
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    return { error: "판매글을 수정하지 못했어요. 잠시 후 다시 시도해 주세요." };
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

  await supabase.from("products").delete().eq("id", id).eq("seller_id", user.id);

  revalidatePath("/products");
  redirect("/products");
}
