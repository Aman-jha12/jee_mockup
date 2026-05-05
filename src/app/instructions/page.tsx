'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { instructions } from '@/lib/instructions';

export default function InstructionsPage() {
  const router = useRouter();
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const verified = localStorage.getItem("verified");
    if (!id || verified !== "true") {
      router.push("/");
    }
  }, [router]);

  // using structured instructions from src/lib/instructions.ts

  return (
    <div className="bg-[#050a18] text-white min-h-screen overflow-x-hidden font-sans selection:bg-red-500/30">
      <Header />

      <main className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1000px] flex flex-col">
          {/* Title Section */}
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-light italic tracking-[0.2em] uppercase text-white mb-1">
              Please Read The
            </h2>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tight uppercase text-[#cc2229]">
              Instructions
            </h1>
            <div className="w-12 h-0.5 bg-[#cc2229] mx-auto mt-2 opacity-50"></div>
          </div>

        {/* Instructions List */}
        <div className="space-y-3 md:space-y-4">
          {instructions.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#0b1224] border border-gray-800 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center transition-all hover:border-red-900/50"
              style={{
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
                borderLeft: '2px solid #cc2229'
              }}
            >
              {/* ID and Icon */}
              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-[#cc2229] opacity-80">{item.id}</span>
                <div className="w-10 h-10 rounded-xl bg-[#161d2f] border border-gray-700 flex items-center justify-center group-hover:border-red-600 transition-colors">
                  <svg
                    className="w-5 h-5 text-[#cc2229]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>

              {/* Instruction Text */}
              <p className="text-gray-400 text-sm md:text-[15px] leading-snug flex-1 font-medium whitespace-pre-line">
                {item.text.map((part, i) => (
                  <span key={i} className={part.bold ? 'font-bold' : ''}>
                    {part.content}
                  </span>
                ))}
              </p>

              {/* Decorative Red Glow */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r from-red-600 to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              setIsGoingBack(true);
              router.push("/");
            }}
            disabled={isGoingBack || isStartingExam}
            className="cursor-pointer px-8 py-3 rounded-xl border border-[#cc2229] text-[#cc2229] font-bold text-sm uppercase tracking-widest hover:bg-red-950/20 transition-all min-w-[180px] flex justify-center items-center h-[48px]"
          >
            {isGoingBack ? (
              <div className="w-4 h-4 border-2 border-[#cc2229] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Go Back"
            )}
          </button>
          <button
            onClick={() => {
              setIsStartingExam(true);
              router.push("/exam");
            }}
            disabled={isGoingBack || isStartingExam}
            className="cursor-pointer px-8 py-3 rounded-xl bg-[#cc2229] text-white font-bold text-sm uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all min-w-[180px] flex justify-center items-center h-[48px]"
          >
            {isStartingExam ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Start Exam"
            )}
          </button>
        </div>
      </div>
      </main>
    </div>
  );
}