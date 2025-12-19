import { NextResponse } from "next/server";

type Params = {
  surveyId: string;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<Params> }
) {
  const { surveyId } = await ctx.params;
  const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://localhost:8080";

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const forwardPayload = body ?? {};

  const upstream = await fetch(
    `${backendBaseUrl}/api/surveys/${encodeURIComponent(surveyId)}/responses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forwardPayload),
    }
  );

  const contentType = upstream.headers.get("content-type") ?? "";
  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": contentType || "application/json",
    },
  });
}
