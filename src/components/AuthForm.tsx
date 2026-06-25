"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { GogumaLogo } from "./GogumaLogo";
import type { AuthState } from "@/app/auth/actions";

type Mode = "login" | "signup";

type AuthAction = (
  prevState: AuthState,
  formData: FormData,
) => Promise<AuthState>;

const COPY = {
  login: {
    title: "다시 오셨네요!",
    subtitle: "고구마마켓에 로그인하세요",
    submit: "로그인",
    switchText: "아직 회원이 아니신가요?",
    switchHref: "/signup",
    switchLabel: "회원가입",
  },
  signup: {
    title: "고구마마켓 시작하기",
    subtitle: "이웃과 따뜻한 중고거래를 시작해요",
    submit: "회원가입",
    switchText: "이미 회원이신가요?",
    switchHref: "/login",
    switchLabel: "로그인",
  },
} as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-skin px-4 py-3 font-semibold text-white transition hover:bg-skin-dark disabled:opacity-60"
    >
      {pending ? "잠시만요…" : label}
    </button>
  );
}

export function AuthForm({ mode, action }: { mode: Mode; action: AuthAction }) {
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});
  const copy = COPY[mode];

  return (
    <div className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-lg shadow-skin/10">
      <div className="mb-6 flex flex-col items-center text-center">
        <GogumaLogo size={56} />
        <h1 className="mt-3 text-2xl font-bold text-skin-dark">{copy.title}</h1>
        <p className="mt-1 text-sm text-foreground/60">{copy.subtitle}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {mode === "signup" && (
          <Field
            label="닉네임"
            name="nickname"
            type="text"
            placeholder="고구마러버"
            autoComplete="nickname"
          />
        )}
        <Field
          label="이메일"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="비밀번호"
          name="password"
          type="password"
          placeholder="6자 이상"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-lg bg-leaf/10 px-3 py-2 text-sm text-leaf">
            {state.message}
          </p>
        )}

        <SubmitButton label={copy.submit} />
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60">
        {copy.switchText}{" "}
        <Link
          href={copy.switchHref}
          className="font-semibold text-flesh-dark hover:underline"
        >
          {copy.switchLabel}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground/80">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="rounded-xl border border-skin/15 bg-cream px-4 py-3 text-foreground outline-none transition focus:border-flesh focus:ring-2 focus:ring-flesh/30"
      />
    </label>
  );
}
