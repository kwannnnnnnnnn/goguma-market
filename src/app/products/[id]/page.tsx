import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { formatPrice, PRODUCT_STATUS, isProductStatus } from "@/lib/products";

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

  // 글쓴이 닉네임 가져오기 (products 와 profiles 는 직접 연결되어 있지 않아 따로 조회)
  const { data: seller } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", product.seller_id)
    .single();

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

        {isOwner && (
          <div className="mt-8 flex gap-3 border-t border-skin/10 pt-6">
            <Link
              href={`/products/${product.id}/edit`}
              className="rounded-xl border border-skin/20 px-4 py-2.5 font-semibold text-skin-dark transition hover:bg-skin/5"
            >
              수정
            </Link>
            <DeleteProductButton id={product.id} />
          </div>
        )}
      </article>
    </main>
  );
}
