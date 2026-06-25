import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/auth/actions";
import { GogumaLogo } from "./GogumaLogo";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname ?? user.email ?? null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-skin/10 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <GogumaLogo size={32} />
          <span className="text-lg font-bold text-skin-dark">고구마마켓</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/products"
            className="rounded-lg px-3 py-1.5 font-medium text-skin-dark transition hover:bg-skin/5"
          >
            판매글
          </Link>
          {user ? (
            <>
              <span className="text-foreground/70">
                <span className="font-semibold text-skin-dark">{nickname}</span>
                님
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-skin/20 px-3 py-1.5 font-medium text-skin-dark transition hover:bg-skin/5"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 font-medium text-skin-dark transition hover:bg-skin/5"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-skin px-3 py-1.5 font-semibold text-white transition hover:bg-skin-dark"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
