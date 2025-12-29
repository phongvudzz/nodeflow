import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import HandleBars from "handlebars";
import { geminiChannel } from "@/inngest/channel/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import prisma from "@/lib/db";

HandleBars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(jsonString);
  return safeString;
});

type GeminiData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
  await publish(geminiChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(geminiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gemini node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publish(geminiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gemini node: User prompt is missing");
  }

  if (!data.credentialId) {
    await publish(geminiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gemini node: Credential is missing");
  }

  const systemPrompt = data.systemPrompt
    ? HandleBars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = HandleBars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
      },
    });
  });

  if (!credential) {
    await publish(geminiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gemini node: Credential is missing");
  }

  const google = createGoogleGenerativeAI({
    apiKey: credential?.value as string,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(geminiChannel().status({ nodeId, status: "success" }));

    return {
      ...context,
      [data.variableName || "myApiCall"]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await publish(geminiChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
