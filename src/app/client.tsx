"use client";

// <-- hooks can only be used in client components
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function ClientGreeting() {
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());

  return <div>{JSON.stringify(users)}</div>;
}
