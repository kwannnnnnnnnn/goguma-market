import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 이메일 인증 링크를 처리하는 라우트 핸들러
// 메일의 링크: /auth/confirm?token_hash=...&type=email&next=/
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // 실패 시 로그인 페이지로
  return NextResponse.redirect(new URL("/login?error=인증에+실패했어요", request.url));
}
