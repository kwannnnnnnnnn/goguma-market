import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GogumaLogo } from "@/components/GogumaLogo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <GogumaLogo size={96} />
      <h1 className="mt-6 text-3xl font-bold text-skin-dark sm:text-4xl">
        이웃과 함께하는 <span className="text-flesh-dark">따뜻한 중고거래</span>
      </h1>
      <p className="mt-3 max-w-md text-foreground/60">
        고구마처럼 정겨운 우리 동네 중고마켓, 고구마마켓에 오신 걸 환영해요.
      </p>

      {user ? (
        <div className="mt-8 flex gap-3">
          <Link
            href="/products"
            className="rounded-xl bg-skin px-6 py-3 font-semibold text-white transition hover:bg-skin-dark"
          >
            판매글 둘러보기
          </Link>
          <Link
            href="/products/new"
            className="rounded-xl border border-skin/20 px-6 py-3 font-semibold text-skin-dark transition hover:bg-skin/5"
          >
            판매글 쓰기
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-skin px-6 py-3 font-semibold text-white transition hover:bg-skin-dark"
          >
            시작하기
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-skin/20 px-6 py-3 font-semibold text-skin-dark transition hover:bg-skin/5"
          >
            로그인
          </Link>
        </div>
      )}
    </main>
  );
}
