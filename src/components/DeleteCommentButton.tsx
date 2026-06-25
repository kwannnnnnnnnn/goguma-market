"use client";

import { useFormStatus } from "react-dom";
import { deleteCommentAction } from "@/app/products/interactions";

function Button() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-foreground/40 transition hover:text-red-500 disabled:opacity-60"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}

export function DeleteCommentButton({
  commentId,
  productId,
}: {
  commentId: string;
  productId: string;
}) {
  return (
    <form
      action={deleteCommentAction}
      onSubmit={(e) => {
        if (!confirm("이 댓글을 삭제할까요?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="productId" value={productId} />
      <Button />
    </form>
  );
}
