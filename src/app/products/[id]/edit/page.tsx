import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/ProductForm";
import { updateProductAction } from "../../actions";

export const metadata = { title: "판매글 수정 · 고구마마켓" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  // 본인 글이 아니면 상세 페이지로 돌려보냅니다.
  if (product.seller_id !== user.id) {
    redirect(`/products/${id}`);
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-skin-dark">판매글 수정</h1>
      <div className="rounded-3xl bg-card p-6 shadow-sm sm:p-8">
        <ProductForm
          action={updateProductAction}
          product={product}
          submitLabel="수정 완료"
          cancelHref={`/products/${id}`}
        />
      </div>
    </main>
  );
}
