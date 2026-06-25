import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  formatPrice,
  PRODUCT_STATUS,
  isProductStatus,
  productImageUrl,
} from "@/lib/products";

export const metadata = { title: "판매글 · 고구마마켓" };

export default async function ProductsPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: { user } }] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, price, status, created_at, image_paths")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-skin-dark">판매글</h1>
        {user && (
          <Link
            href="/products/new"
            className="rounded-xl bg-skin px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-skin-dark"
          >
            판매글 쓰기
          </Link>
        )}
      </div>

      {!products || products.length === 0 ? (
        <div className="rounded-2xl bg-card px-6 py-16 text-center text-foreground/60 shadow-sm">
          아직 올라온 판매글이 없어요.
          {user ? " 첫 판매글을 올려보세요!" : " 로그인하고 첫 글을 올려보세요!"}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => {
            const status = isProductStatus(product.status)
              ? PRODUCT_STATUS[product.status]
              : null;
            return (
              <li key={product.id}>
                <Link
                  href={`/products/${product.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-skin/5">
                    {product.image_paths.length > 0 ? (
                      <Image
                        src={productImageUrl(product.image_paths[0])}
                        alt={product.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-2xl">
                        🍠
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {product.title}
                    </p>
                    <p className="mt-1 font-bold text-skin-dark">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  {status && (
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
