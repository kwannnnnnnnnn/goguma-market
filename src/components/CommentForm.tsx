"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addCommentAction, type CommentFormState } from "@/app/products/interactions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-end rounded-xl bg-skin px-5 py-2.5 font-semibold text-white transition hover:bg-skin-dark disabled:opacity-60"
    >
      {pending ? "등록 중…" : "댓글 등록"}
    </button>
  );
}

export function CommentForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState<CommentFormState, FormData>(
    addCommentAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="productId" value={productId} />
      {/* state.ok 값이 바뀌면 textarea 가 새로 그려져 입력칸이 비워집니다. */}
      <textarea
        key={state.ok}
        name="content"
        rows={3}
        required
        maxLength={1000}
        placeholder="따뜻한 댓글을 남겨주세요 :)"
        className="resize-y rounded-xl border border-skin/15 bg-cream px-4 py-3 text-foreground outline-none transition focus:border-flesh focus:ring-2 focus:ring-flesh/30"
      />
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
