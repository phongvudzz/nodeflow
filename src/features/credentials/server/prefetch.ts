import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.credentials.getMany>;

export const prefetchCredentials = (input: Input) => {
  return prefetch(trpc.credentials.getMany.queryOptions(input));
};

export const prefetchCredential = (id: string) => {
  return prefetch(trpc.credentials.getOne.queryOptions({ id }));
};
