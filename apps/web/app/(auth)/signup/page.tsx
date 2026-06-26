import { AuthLayout } from "../auth-layout";
import { SignupForm } from "@repo/ui/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthLayout
      headline={
        <>
          Start your streak
          <br />
          <span className="text-primary">
            today.
          </span>
        </>
      }
      subtext="Every habit tracked here starts on day one. Yours can too."
    >
      <SignupForm />
    </AuthLayout>
  );
}