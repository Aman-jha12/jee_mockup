'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { instructions } from '@/lib/instructions';
import { isSessionValidForExam, markExamStarted } from '@/lib/exam-session';

export default function InstructionsPage() {
  const router = useRouter();
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);

  useEffect(() => {
    if (!isSessionValidForExam()) {
      router.push("/");
    }
  }, [router]);

  // using structured instructions from src/lib/instructions.ts

  return (
    <div className="bg-[#050a18] text-white min-h-screen overflow-x-hidden font-sans selection:bg-red-500/30 relative">
      {/* 6 LOGO GRID - PINNED TO ABSOLUTE EDGES */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-15 grid grid-cols-3 grid-rows-2"
      >
        {[...Array(6)].map((_, i) => {
          // Determine horizontal alignment based on column index
          const col = i % 3;
          const alignment = col === 0 ? 'left' : col === 2 ? 'right' : 'center';

          return (
            <div
              key={i}
              className="w-full h-full bg-no-repeat"
              style={{
                backgroundImage: "url('/images/tig_logo_copyright.png')",
                backgroundSize: '100%', // Massive size to cover the cell
                backgroundPosition: `${alignment} center`, // Force left or right edge
                filter: 'drop-shadow(0 0 35px rgba(220,38,38,0.3))'
              }}
            />
          );
        })}
      </div>

      <div className="relative z-20">
        <Header />
      </div>

      <main className="relative z-10 w-full h-[calc(100vh-110px)] flex flex-col justify-start items-center px-4 md:px-8 pt-4 pb-4 overflow-hidden">
        <div className="w-full max-w-[1000px] flex flex-col h-full">
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

          {/* Instructions List - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {instructions.map((item) => (
              <div
                key={item.id}
                className="group relative bg-[#0b1224] border border-gray-800 rounded-lg p-5 flex flex-col gap-3 transition-all hover:border-red-900/50"
                style={{
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                  borderLeft: '2px solid #cc2229'
                }}
              >
                {/* ID and Icon */}
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-[#cc2229] opacity-80">{item.id}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#161d2f] border border-gray-700 flex items-center justify-center group-hover:border-red-600 transition-colors shrink-0">
                    <svg
                      className="w-4 h-4 text-[#cc2229]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>

                {/* Instruction Text */}
                <div className="text-gray-400 text-[13px] md:text-[14px] leading-relaxed flex-1 font-medium whitespace-pre-line overflow-y-auto max-h-[80px] scrollbar-hide">
                  {item.text.map((part, i) => (
                    <span key={i} className={part.bold ? 'font-bold text-gray-200' : ''}>
                      {part.content}
                    </span>
                  ))}
                </div>

                {/* Decorative Red Glow */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r from-red-600 to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-auto mb-4">
            <button
              onClick={() => {
                setIsGoingBack(true);
                router.push("/");
              }}
              disabled={isGoingBack || isStartingExam}
              className="cursor-pointer px-6 py-2 rounded-lg border border-[#cc2229] text-[#cc2229] font-bold text-[12px] uppercase tracking-widest hover:bg-red-950/20 transition-all min-w-[150px] flex justify-center items-center h-[42px]"
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
                markExamStarted();
                router.push("/exam");
              }}
              disabled={isGoingBack || isStartingExam}
              className="cursor-pointer px-6 py-2 rounded-lg bg-[#cc2229] text-white font-bold text-[12px] uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all min-w-[150px] flex justify-center items-center h-[42px]"
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