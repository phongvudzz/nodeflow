import { LoginForm } from "@/features/auth/login-form";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return (
    <div>
      <LoginForm />
    </div>
  );
};

export default Page;
