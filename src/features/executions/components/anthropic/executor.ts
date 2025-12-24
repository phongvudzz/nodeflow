import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import HandleBars from "handlebars";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { openAIChannel } from "@/inngest/channel/openai";

HandleBars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(jsonString);
  return safeString;
});

type AnthropicData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
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

  // TODO: Throw error if creadential is missing

  const systemPrompt = data.systemPrompt
    ? HandleBars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = HandleBars.compile(data.userPrompt)(context);

  // TODO: Fetch credential that user selected
  const credentialValue = process.env.OPENAI_API_KEY!;

  const anthropic = createAnthropic({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("anthorpic-generate-text", generateText, {
      model: anthropic("claude-3-7-sonnet-latest"),
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
      [data.variableName || "myAnthropic"]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await publish(openAIChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
