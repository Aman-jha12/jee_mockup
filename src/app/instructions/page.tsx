"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const instructionLines = [
  "This is a dummy instruction block representing official exam rules.",
  "Total duration is 180 minutes. The timer is visible throughout the test.",
  "Each correct answer gives +4 marks.",
  "MCQ wrong answer carries -1 negative marking.",
  "Numerical wrong answer carries 0 negative marking.",
  "You may switch subjects at any time.",
  "Use Mark for Review if you wish to revisit the question.",
  "Click Save & Next to store answer and move forward.",
  "Click Submit when you are ready to finish the exam.",
];

export default function InstructionsPage() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [hasScrolledBottom, setHasScrolledBottom] = useState(false);

  const onScroll = () => {
    const element = boxRef.current;
    if (!element) return;
    const reachedBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 4;
    if (reachedBottom) setHasScrolledBottom(true);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center p-6">
      <section className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Instructions</h1>
        <div
          ref={boxRef}
          onScroll={onScroll}
          className="h-72 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
        >
          {Array.from({ length: 7 }).map((_, blockIdx) => (
            <div key={blockIdx} className="space-y-2">
              {instructionLines.map((line, lineIdx) => (
                <p key={`${blockIdx}-${lineIdx}`}>{line}</p>
              ))}
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={!hasScrolledBottom}
          onClick={() => router.push("/exam")}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          I have read this
        </button>
      </section>
    </main>
  );
}
