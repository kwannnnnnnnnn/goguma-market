"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

// 회원가입
export async function signupAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nickname || !email || !password) {
    return { error: "닉네임, 이메일, 비밀번호를 모두 입력해 주세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 해요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname }, // 트리거에서 profiles.nickname 으로 사용됩니다.
    },
  });

  if (error) {
    return { error: error.message };
  }

  // 이메일 인증이 꺼져 있으면 바로 세션이 생깁니다.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  // 이메일 인증이 켜져 있으면 확인 메일 안내
  return {
    message: `${email} 로 인증 메일을 보냈어요. 메일의 링크를 눌러 가입을 완료해 주세요.`,
  };
}

// 로그인
export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호를 확인해 주세요." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// 로그아웃
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
