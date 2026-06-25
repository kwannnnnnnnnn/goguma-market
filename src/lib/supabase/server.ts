import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버 컴포넌트 / 서버 액션 / 라우트 핸들러에서 사용하는 Supabase 클라이언트
// Next.js 15+ 에서는 cookies() 가 비동기이므로 await 가 필요합니다.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서 호출된 경우 set 이 막힐 수 있습니다.
            // 미들웨어에서 세션을 갱신하고 있으면 무시해도 됩니다.
          }
        },
      },
    },
  );
}
