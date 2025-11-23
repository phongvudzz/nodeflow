import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // sleep for 4 seconds
    await step.sleep("wait-a-moment", "4s");

    await step.sleep("wait-a-moment", "5s");
    await step.sleep("wait-a-moment", "6s");
    await step.sleep("wait-a-moment", "7s");

    return prisma.workflow.create({
      data: {
        name: "workflow-from-inngest",
      },
    });
  }
);
