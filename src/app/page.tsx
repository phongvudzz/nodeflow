import prisma from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function Home() {
  const users = await prisma.user.findMany();

  return <div className={cn("text-red-500")}>{JSON.stringify(users)}</div>;
}
