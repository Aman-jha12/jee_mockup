import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL_HINT =
  "Use the deployed Apps Script Web App URL, e.g. https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec";

function resolveWebhookEndpoint(rawUrl: string | undefined): { endpoint?: string; configError?: string } {
  if (!rawUrl || rawUrl.trim().length === 0) {
    return {
      configError:
        "Google Sheets submission webhook is not configured. Set GOOGLE_SHEETS_SUBMISSION_WEBHOOK_URL in .env.local.",
    };
  }

  const trimmed = rawUrl.trim();

  if (trimmed.includes("docs.google.com")) {
    return {
      configError:
        "Configured webhook points to Google Docs/Drive, not Apps Script. " + APPS_SCRIPT_URL_HINT,
    };
  }

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
  let payload: Record<string, unknown>;

  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { success: false, message: "Payload must be a JSON object." },
      { status: 400 }
    );
  }

  const id = typeof payload.id === "string" ? payload.id.trim() : "";
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing required field: id." },
      { status: 400 }
    );
  }

  const isRegistrationPayload = ["name", "number", "city", "class_status", "stream", "email"].some(
    (key) => typeof payload[key] === "string" && String(payload[key]).trim().length > 0
  );
  const isExamPayload = ["total_marks", "mathematics", "physics", "chemistry"].some(
    (key) => typeof payload[key] === "number"
  );

  if (!isRegistrationPayload && !isExamPayload) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Payload must include registration fields (name/number/city/class_status/stream/email) or exam fields (total_marks/mathematics/physics/chemistry).",
      },
      { status: 400 }
    );
  }

  const configuredWebhookUrl =
    process.env.GOOGLE_SHEETS_SUBMISSION_WEBHOOK_URL || process.env.NEXT_PUBLIC_API_URL;
  const { endpoint, configError } = resolveWebhookEndpoint(configuredWebhookUrl);

  if (!endpoint) {
    return NextResponse.json(
      {
        success: false,
        message: configError ?? "Google Sheets submission webhook is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const upstreamBodyText = await response.text();

    if (!response.ok) {
      const normalizedDetails = upstreamBodyText.includes("file you have requested does not exist")
        ? "Webhook URL is invalid or undeployed. " + APPS_SCRIPT_URL_HINT
        : upstreamBodyText || "No response body from webhook.";

      console.error("Google Sheets webhook rejected the submission:", {
        status: response.status,
        body: upstreamBodyText,
      });
      return NextResponse.json(
        {
          success: false,
          message: `Google Sheets webhook returned HTTP ${response.status}.`,
          details: normalizedDetails,
        },
        { status: 502 }
      );
    }

    if (upstreamBodyText) {
      try {
        const upstreamJson = JSON.parse(upstreamBodyText) as {
          success?: boolean;
          message?: string;
          error?: string;
        };

        if (upstreamJson.success === false) {
          const reason = upstreamJson.message || upstreamJson.error || "Webhook returned success=false.";
          return NextResponse.json(
            {
              success: false,
              message: "Google Sheets webhook reported a save failure.",
              details: reason,
            },
            { status: 502 }
          );
        }
      } catch {
        // Non-JSON successful response is acceptable.
      }
    }
  } catch (error) {
    console.error("Failed to sync submission to Google Sheets endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save submission to Google Sheets.",
        details: error instanceof Error ? error.message : "Unknown network error.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
