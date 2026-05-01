"use client";

import { ExamProvider } from "@/context/exam-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ExamProvider>{children}</ExamProvider>;
}
