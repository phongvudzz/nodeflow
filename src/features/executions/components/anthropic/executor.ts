import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import HandleBars from "handlebars";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { openAIChannel } from "@/inngest/channel/openai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

HandleBars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(jsonString);
  return safeString;
});

type AnthropicData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
  userId?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
  userId,
}) => {
  await publish(openAIChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Anthropic node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Anthropic node: User prompt is missing");
  }

  if (!data.credentialId) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Anthropic node: Credential is missing");
  }

  const systemPrompt = data.systemPrompt
    ? HandleBars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = HandleBars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Anthropic node: Credential not found");
  }

  const anthropic = createAnthropic({
    apiKey: decrypt(credential?.value),
  });

  try {
    const { steps } = await step.ai.wrap(
      "anthorpic-generate-text",
      generateText,
      {
        model: anthropic("claude-3-7-sonnet-latest"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(openAIChannel().status({ nodeId, status: "success" }));

    return {
      ...context,
      [data.variableName || "myAnthropic"]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
