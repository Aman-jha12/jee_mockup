import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL_HINT =
  "Use the deployed Apps Script Web App URL, e.g. https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec";

function resolveWebhookEndpoint(rawUrl: string | undefined): { endpoint?: string; configError?: string } {
  if (!rawUrl || rawUrl.trim().length === 0) {
    return {
      configError:
        "Google Sheets webhook is not configured. Set NEXT_PUBLIC_SHEETS_API_URL or GOOGLE_SHEETS_SUBMISSION_WEBHOOK_URL in .env.local.",
    };
  }

  const trimmed = rawUrl.trim();

  const scriptBaseMatch = trimmed.match(/^https:\/\/script\.google\.com\/macros\/s\/[^/]+/i);
  if (!scriptBaseMatch) {
    return {
      configError: "Webhook URL must be an Apps Script Web App URL. " + APPS_SCRIPT_URL_HINT,
    };
  }

  // Normalize bare deployment URLs to /exec.
  if (/\/(exec|dev)(\?.*)?$/i.test(trimmed)) {
    return { endpoint: trimmed };
  }

  return { endpoint: `${scriptBaseMatch[0]}/exec` };
}

export async function POST(req: NextRequest) {
  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  const configuredWebhookUrl = process.env.NEXT_PUBLIC_SHEETS_API_URL || process.env.GOOGLE_SHEETS_SUBMISSION_WEBHOOK_URL || process.env.NEXT_PUBLIC_API_URL;
  const { endpoint, configError } = resolveWebhookEndpoint(configuredWebhookUrl);

  if (!endpoint) {
    console.error("[Sheets API Proxy] Config error:", configError);
    return NextResponse.json({ success: false, message: configError ?? "Apps Script webhook not configured." }, { status: 500 });
  }

  console.log("[Sheets API Proxy] Forwarding request to:", endpoint);
  console.log("[Sheets API Proxy] Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log("[Sheets API Proxy] Response status:", response.status);
    console.log("[Sheets API Proxy] Response body:", text);

    if (!response.ok) {
      console.error("[Sheets API Proxy] Apps Script returned error:", { status: response.status, body: text });
      return NextResponse.json({
        success: false,
        message: `Apps Script returned HTTP ${response.status}.`,
        details: text,
        endpoint: endpoint
      }, { status: 502 });
    }

    // Try to parse JSON, otherwise return raw text as string
    try {
      const json = JSON.parse(text);
      console.log("[Sheets API Proxy] Parsed JSON response:", json);
      return NextResponse.json(json, { status: 200 });
    } catch (parseErr) {
      console.warn("[Sheets API Proxy] Failed to parse response as JSON, returning as text:", text);
      return NextResponse.json({ success: true, data: typeof text === 'string' ? text : null }, { status: 200 });
    }
  } catch (err) {
    console.error("[Sheets API Proxy] Network error:", err);
    return NextResponse.json({
      success: false,
      message: "Failed to reach Apps Script endpoint.",
      details: err instanceof Error ? err.message : String(err),
      endpoint: endpoint
    }, { status: 502 });
  }
}
