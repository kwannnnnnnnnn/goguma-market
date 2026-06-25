import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/ProductForm";
import { createProductAction } from "../actions";

export const metadata = { title: "판매글 쓰기 · 고구마마켓" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-skin-dark">판매글 쓰기</h1>
      <div className="rounded-3xl bg-card p-6 shadow-sm sm:p-8">
        <ProductForm
          action={createProductAction}
          submitLabel="등록하기"
          cancelHref="/products"
        />
      </div>
    </main>
  );
}
