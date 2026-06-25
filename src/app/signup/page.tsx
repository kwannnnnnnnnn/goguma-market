import { AuthForm } from "@/components/AuthForm";
import { signupAction } from "@/app/auth/actions";

export const metadata = { title: "회원가입 · 고구마마켓" };

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <AuthForm mode="signup" action={signupAction} />
    </main>
  );
}
