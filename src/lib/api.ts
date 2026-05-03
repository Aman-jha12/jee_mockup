const API_URL = process.env.NEXT_PUBLIC_API_URL!;
export async function registerUser(data: {
  id: string;
  name: string;
  number: string;
  city: string;
  class_status: string;
  stream: string;
  email: string;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res.text();
}

export async function submitExam(data: {
  id: string;
  total_marks: number;
  mathematics: number;
  physics: number;
  chemistry: number;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res.text();
}