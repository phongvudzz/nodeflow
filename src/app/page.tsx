import { requireAuth } from "@/lib/auth-utils";

async function Page() {
  await requireAuth();

  return (
    <div className="size-full bg-black text-red-500 flex items-center justify-center h-screen">
      protected server component
    </div>
  );
}

export default Page;
