import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import HandleBars from "handlebars";
import { decode } from "html-entities";
import ky from "ky";
import { slackChannel } from "@/inngest/channel/slack";

HandleBars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(jsonString);
  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
  await publish(slackChannel().status({ nodeId, status: "loading" }));

  if (!data.content) {
    await publish(slackChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Slack node: Content is missing");
  }

  const rawContent = HandleBars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(slackChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Slack node: WebhookUrl is missing");
      }

      await ky.post(data.webhookUrl, {
        json: {
          content: content,
        },
      });

      if (!data.variableName) {
        await publish(slackChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Slack node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName || "mySlack"]: {
          messageContent: content,
        },
      };
    });
    await publish(slackChannel().status({ nodeId, status: "success" }));

    return result;
  } catch (error) {
    await publish(slackChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
