import { NextResponse } from "next/server";
import { fetchQuestions } from "@/lib/sheets";

export async function GET() {
  const questions = await fetchQuestions();
  return NextResponse.json({ questions });
}
