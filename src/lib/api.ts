const REGISTRATION_DRAFT_KEY = "jee_mock_registration_draft";

type RegistrationDraft = {
  id: string;
  name: string;
  number: string;
  city: string;
  class_status: string;
  stream: string;
  email: string;
};

function storeRegistrationDraft(data: RegistrationDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(data));
}

function readRegistrationDraft(): RegistrationDraft | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(REGISTRATION_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RegistrationDraft;
  } catch {
    return null;
  }
}

async function postToSubmissionApi(data: Record<string, string | number>) {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = "Failed to save submission.";
    try {
      const payload = (await response.json()) as { message?: string; details?: string };
      if (payload.message) {
        message = payload.message;
      }
      if (payload.details) {
        message = `${message} (${payload.details})`;
      }
    } catch {
      // Keep the generic message when the response body is not JSON.
    }
    throw new Error(message);
  }
}

export async function registerUser(data: {
  id: string;
  name: string;
  number: string;
  city: string;
  class_status: string;
  stream: string;
  email: string;
}) {
  storeRegistrationDraft(data);
  await postToSubmissionApi(data);
}

export async function submitExam(data: {
  id: string;
  total_marks: number;
  mathematics: number;
  physics: number;
  chemistry: number;
}) {
  const registrationDraft = readRegistrationDraft();
  const payload = {
    ...(registrationDraft ?? {}),
    ...data,
    id: data.id,
  };

  await postToSubmissionApi(payload);

  if (typeof window !== "undefined") {
    localStorage.removeItem(REGISTRATION_DRAFT_KEY);
  }
}