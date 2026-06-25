"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CommentFormState = {
  error?: string;
  ok?: number; // 등록 성공할 때마다 값이 바뀌어, 입력창을 비우는 신호로 씁니다.
};

// 좋아요 누르기 / 취소 (한 번 더 누르면 취소)
export async function toggleLikeAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("product_likes")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("product_likes")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("product_likes")
      .insert({ product_id: productId, user_id: user.id });
  }

  revalidatePath(`/products/${productId}`);
}

// 댓글 등록
export async function addCommentAction(
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const productId = String(formData.get("productId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요해요." };
  }
  if (!content) {
    return { error: "댓글 내용을 입력해 주세요." };
  }
  if (content.length > 1000) {
    return { error: "댓글은 1000자 이내로 입력해 주세요." };
  }

  const { error } = await supabase
    .from("product_comments")
    .insert({ product_id: productId, user_id: user.id, content });

  if (error) {
    return { error: "댓글을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath(`/products/${productId}`);
  return { ok: Date.now() };
}

// 댓글 삭제 (본인 것만)
export async function deleteCommentAction(formData: FormData) {
  const commentId = String(formData.get("commentId") ?? "");
  const productId = String(formData.get("productId") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("product_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath(`/products/${productId}`);
}
