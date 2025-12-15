import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter: workflowId",
        },
        { status: 400 }
      );
    }
    const body = await request.json();
    const formData = {
      ...body,
      raw: body,
    };
  } catch (error) {
    console.error("Google form webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process Google Form session",
      },
      { status: 500 }
    );
  }
}
