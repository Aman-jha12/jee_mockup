"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExamResult } from "@/types/exam";

const RESULT_KEY = "jee_mock_exam_latest_result";

export default function ResultPage() {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(RESULT_KEY);
    if (raw) setResult(JSON.parse(raw) as ExamResult);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 2 : 100));
    }, 25);
    return () => clearInterval(timer);
  }, []);

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl bg-white p-8 text-center shadow ring-1 ring-slate-200">
          <p className="mb-4 text-slate-700">No result found yet.</p>
          <Link href="/" className="rounded-md bg-blue-600 px-4 py-2 text-white">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6">
      <section className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Test Result</h1>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card label="Total Score" value={String(result.totalScore)} />
          <Card label="Attempted" value={String(result.attempted)} />
          <Card label="Unattempted" value={String(result.unattempted)} />
          <Card label="Correct" value={String(result.correct)} />
          <Card label="Wrong" value={String(result.wrong)} />
          <Card label="Submitted At" value={new Date(result.submittedAt).toLocaleString()} />
        </div>

        <h2 className="mt-7 text-xl font-bold">Subject-wise Score</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {Object.entries(result.subjectWise).map(([subject, summary]) => (
            <div key={subject} className="rounded-lg border border-slate-200 p-4">
              <p className="mb-2 text-lg font-semibold capitalize">{subject}</p>
              <p className="text-sm">Score: {summary.score}</p>
              <p className="text-sm">Attempted: {summary.attempted}</p>
              <p className="text-sm">Unattempted: {summary.unattempted}</p>
              <p className="text-sm">Correct: {summary.correct}</p>
              <p className="text-sm">Wrong: {summary.wrong}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
