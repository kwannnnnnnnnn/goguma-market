import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { LikeButton } from "@/components/LikeButton";
import { CommentForm } from "@/components/CommentForm";
import { DeleteCommentButton } from "@/components/DeleteCommentButton";
import {
  formatPrice,
  PRODUCT_STATUS,
  isProductStatus,
  productImageUrl,
} from "@/lib/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === product.seller_id;

  // 글쓴이 닉네임 / 좋아요 수 / 댓글(작성자 닉네임 포함) 을 한 번에 가져옵니다.
  const [{ data: seller }, { count: likeCount }, { data: comments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("nickname")
        .eq("id", product.seller_id)
        .single(),
      supabase
        .from("product_likes")
        .select("*", { count: "exact", head: true })
        .eq("product_id", id),
      supabase
        .from("product_comments")
        .select("id, content, created_at, user_id, profiles(nickname)")
        .eq("product_id", id)
        .order("created_at", { ascending: true }),
    ]);

  // 내가 이 글에 좋아요를 눌렀는지 확인 (로그인했을 때만)
  let liked = false;
  if (user) {
    const { data: myLike } = await supabase
      .from("product_likes")
      .select("product_id")
      .eq("product_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    liked = !!myLike;
  }

  const commentList = comments ?? [];
  const status = isProductStatus(product.status)
    ? PRODUCT_STATUS[product.status]
    : null;
  const createdAt = new Date(product.created_at).toLocaleDateString("ko-KR");

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10">
      <Link
        href="/products"
        className="text-sm text-foreground/60 transition hover:text-skin-dark"
      >
        ← 판매글 목록
      </Link>

      <article className="mt-4 rounded-3xl bg-card p-6 shadow-sm sm:p-8">
        {product.image_paths.length > 0 && (
          <div className="mb-6 flex flex-col gap-3">
            {product.image_paths.map((path) => (
              <div
                key={path}
                className="relative aspect-square w-full overflow-hidden rounded-2xl bg-skin/5"
              >
                <Image
                  src={productImageUrl(path)}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 576px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            {product.title}
          </h1>
          {status && (
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          )}
        </div>

        <p className="mt-3 text-2xl font-bold text-skin-dark">
          {formatPrice(product.price)}
        </p>

        <p className="mt-2 text-sm text-foreground/50">
          {seller?.nickname ?? "알 수 없는 사용자"} · {createdAt}
        </p>

        {product.description && (
          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground/80">
            {product.description}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-skin/10 pt-6">
          <LikeButton
            productId={product.id}
            liked={liked}
            count={likeCount ?? 0}
            isLoggedIn={!!user}
          />
          {isOwner && (
            <div className="flex gap-3">
              <Link
                href={`/products/${product.id}/edit`}
                className="rounded-xl border border-skin/20 px-4 py-2.5 font-semibold text-skin-dark transition hover:bg-skin/5"
              >
                수정
              </Link>
              <DeleteProductButton id={product.id} />
            </div>
          )}
        </div>
      </article>

      {/* 댓글 영역 */}
      <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-skin-dark">
          댓글 {commentList.length}
        </h2>

        <ul className="mt-4 flex flex-col gap-4">
          {commentList.length === 0 ? (
            <li className="text-sm text-foreground/50">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </li>
          ) : (
            commentList.map((comment) => (
              <li
                key={comment.id}
                className="flex flex-col gap-1 border-b border-skin/10 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-skin-dark">
                    {comment.profiles?.nickname ?? "알 수 없는 사용자"}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground/40">
                      {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                    </span>
                    {user?.id === comment.user_id && (
                      <DeleteCommentButton
                        commentId={comment.id}
                        productId={product.id}
                      />
                    )}
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-foreground/80">
                  {comment.content}
                </p>
              </li>
            ))
          )}
        </ul>

        <div className="mt-6">
          {user ? (
            <CommentForm productId={product.id} />
          ) : (
            <p className="text-sm text-foreground/60">
              댓글을 남기려면{" "}
              <Link
                href="/login"
                className="font-semibold text-flesh-dark hover:underline"
              >
                로그인
              </Link>{" "}
              해주세요.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
