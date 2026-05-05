const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function postToApi(data: Record<string, any>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  const text = await res.text();
  if (text.toLowerCase().includes("not found") || text.toLowerCase().includes("error")) {
    throw new Error(`Apps Script Error: ${text}`);
  }

  return text;
}

// =========================
// INSERT USER
// =========================
export async function insertUser(data: {
  id: string;
  name: string;
  number: string;
  city: string;
  class_status: string;
  stream: string;
  email: string;
  date_time_initial: string;
}) {
  return postToApi(data);
}

// =========================
// VERIFY USER
// =========================
export async function verifyUser(data: {
  id: string;
  verified: boolean;
  date_time_initial: string;
}) {
  return postToApi(data);
}

// =========================
// SUBMIT EXAM
// =========================
export async function submitExam(data: {
  id: string;
  total_marks: number;
  mathematics: number;
  physics: number;
  chemistry: number;
}) {
  return postToApi(data);
}