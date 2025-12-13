import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: {
    executionId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();

  const { executionId } = params;
  return <div>{executionId}</div>;
};

export default Page;
