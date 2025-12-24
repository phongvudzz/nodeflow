import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import HandleBars from "handlebars";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { openAIChannel } from "@/inngest/channel/openai";

HandleBars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(jsonString);
  return safeString;
});

type OpenAIData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
  await publish(openAIChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("OpenAI node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("OpenAI node: User prompt is missing");
  }

  // TODO: Throw error if creadential is missing

  const systemPrompt = data.systemPrompt
    ? HandleBars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = HandleBars.compile(data.userPrompt)(context);

  // TODO: Fetch credential that user selected
  const credentialValue = process.env.OPENAI_API_KEY!;

  const openai = createOpenAI({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai("gpt-4"),
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

    await publish(openAIChannel().status({ nodeId, status: "success" }));

    return {
      ...context,
      [data.variableName || "myOpenAI"]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
