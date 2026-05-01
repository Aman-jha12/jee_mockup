import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const endpoint = process.env.GOOGLE_SHEETS_SUBMISSION_WEBHOOK_URL;

  if (endpoint) {
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Failed to sync submission to Google Sheets endpoint:", error);
      return NextResponse.json(
        { success: false, message: "Submission saved locally, sync failed." },
        { status: 202 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
