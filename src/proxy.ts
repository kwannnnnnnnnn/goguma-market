import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 부터는 middleware 대신 proxy 규칙을 사용합니다.
export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에서 세션을 갱신합니다:
     * - _next/static, _next/image (정적 파일)
     * - favicon.ico, 이미지 파일들
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
