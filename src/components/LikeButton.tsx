"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { toggleLikeAction } from "@/app/products/interactions";

function HeartButton({ liked, count }: { liked: boolean; count: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold transition disabled:opacity-60 ${
        liked
          ? "border-flesh bg-flesh/10 text-flesh-dark"
          : "border-skin/20 text-skin-dark hover:bg-skin/5"
      }`}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      <span>좋아요 {count}</span>
    </button>
  );
}

export function LikeButton({
  productId,
  liked,
  count,
  isLoggedIn,
}: {
  productId: string;
  liked: boolean;
  count: number;
  isLoggedIn: boolean;
}) {
  // 로그인하지 않았으면 누를 때 로그인 페이지로 보냅니다.
  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-xl border border-skin/20 px-4 py-2.5 font-semibold text-skin-dark transition hover:bg-skin/5"
      >
        <span>🤍</span>
        <span>좋아요 {count}</span>
      </Link>
    );
  }

  return (
    <form action={toggleLikeAction}>
      <input type="hidden" name="productId" value={productId} />
      <HeartButton liked={liked} count={count} />
    </form>
  );
}
