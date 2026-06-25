import { AuthForm } from "@/components/AuthForm";
import { loginAction } from "@/app/auth/actions";

export const metadata = { title: "로그인 · 고구마마켓" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <AuthForm mode="login" action={loginAction} />
    </main>
  );
}
