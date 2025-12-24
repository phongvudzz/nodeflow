"use client";

import { CredentialType } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import {
  useCreateCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";
import { useUpgradeModal } from "../hooks/use-upgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(CredentialType),
  value: z.string().min(1, "API key is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  { value: CredentialType.OPENAI, label: "OpenAI", logo: "/logos/openai.png" },
  { value: CredentialType.GEMINI, label: "Gemini", logo: "/logos/gemini.png" },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.png",
  },
];

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  return (
    <div>
      <h2>{initialData?.name || "New Credential"}</h2>
      <p>Type: {initialData?.type}</p>
      <p>Value: {initialData?.value}</p>
    </div>
  );
};
