'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { isExamSubmitted, isSessionValidForExam } from '@/lib/exam-session';

export default function ResultPage() {
  const router = useRouter();
  const [marks, setMarks] = useState({ mathematics: 70, physics: 60, chemistry: 50, total_marks: 180 });
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [isViewingSolutions, setIsViewingSolutions] = useState(false);

  useEffect(() => {
    if (!isSessionValidForExam()) {
      router.push("/");
      return;
    }

    if (!isExamSubmitted()) {
      router.push("/exam");
      return;
    }

    queueMicrotask(() => {
      const saved = localStorage.getItem("examMarks");
      if (saved) {
        setMarks(JSON.parse(saved));
      }
    });
  }, [router]);

  const getStatus = (score: number) => score >= 75 ? 'Excellent' : score >= 60 ? 'Good' : 'Average';

  const subjects = [
    { name: 'Mathematics', score: marks.mathematics, total: 100, icon: 'grid_view', status: getStatus(marks.mathematics) },
    { name: 'Physics', score: marks.physics, total: 100, icon: 'science', status: getStatus(marks.physics) },
    { name: 'Chemistry', score: marks.chemistry, total: 100, icon: 'biotech', status: getStatus(marks.chemistry) },
  ];

  return (
    <div className="bg-[#050a18] text-white h-screen w-screen overflow-hidden font-sans selection:bg-red-500/30 relative">

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

      <main className="relative z-10 w-full h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 md:px-6">
        <div className="w-full max-w-[1100px] transform scale-[0.88] origin-center flex flex-col">

          {/* Main Score Card */}
          <div className="relative bg-[#0b1224] border border-gray-800 rounded-3xl p-6 md:p-8 mb-10 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-32 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Your Score</p>
                <div className="w-6 h-1 bg-red-600 mb-4"></div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl md:text-7xl font-black tracking-tighter text-red-600">{marks.total_marks}</span>
                  <span className="text-3xl md:text-4xl font-bold text-gray-500">/300</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="cursor-pointer mt-4 md:mt-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>

            <div className="relative h-1 bg-gray-800 rounded-full mb-8">
              <div className="absolute top-0 left-0 h-full bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" style={{ width: `${(marks.total_marks / 300) * 100}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_#ff0000]"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
              {[
                { l: 'M', n: 'Mathematics', s: `${marks.mathematics}/100` },
                { l: 'P', n: 'Physics', s: `${marks.physics}/100` },
                { l: 'C', n: 'Chemistry', s: `${marks.chemistry}/100` }
              ].map((sub, i) => (
                <div key={sub.n} className={`flex items-center gap-4 ${i !== 2 ? 'md:border-r border-gray-800' : ''}`}>
                  <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                    {sub.l}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white">{sub.s.split('/')[0]}</span>
                      <span className="text-sm text-gray-500 font-bold">/{sub.s.split('/')[1]}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{sub.n}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-3">
            Detailed Breakdown <span className="w-6 h-0.5 bg-red-600 opacity-50"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
            {subjects.map((subject) => (
              <div key={subject.name} className="bg-[#0b1224] border border-gray-800 rounded-2xl p-5 hover:border-red-900/40 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#161d2f] border border-gray-700 flex items-center justify-center">
                    <div className="text-red-600 opacity-80">
                      {subject.name === 'Mathematics' && '++'}
                      {subject.name === 'Physics' && '⚛'}
                      {subject.name === 'Chemistry' && '🧪'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{subject.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-red-600">{subject.score}</span>
                      <span className="text-lg font-bold text-gray-600">/{subject.total}</span>
                    </div>
                  </div>
                </div>

                <div className="h-1 bg-gray-800 rounded-full mb-4">
                  <div
                    className="h-full bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.4)]"
                    style={{ width: `${(subject.score / subject.total) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-400">{subject.score}%</span>
                  <span className={subject.status === 'Good' ? 'text-green-500' : 'text-yellow-500'}>
                    • {subject.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
            <button
              onClick={() => {
                setIsGoingBack(true);
                router.push("/");
              }}
              disabled={isGoingBack || isViewingSolutions}
              className="cursor-pointer flex items-center gap-2 px-8 py-3 rounded-xl border border-gray-800 text-gray-400 font-bold uppercase tracking-widest hover:border-red-600 hover:text-white transition-all min-w-[200px] justify-center h-[48px] text-sm bg-[#050a18]/80 backdrop-blur-sm"
            >
              {isGoingBack ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Go Back <span>←</span></>
              )}
            </button>
            <button
              onClick={() => {
                setIsViewingSolutions(true);
                router.push("/solutions");
              }}
              disabled={isGoingBack || isViewingSolutions}
              className="cursor-pointer flex items-center gap-2 px-8 py-3 rounded-xl bg-[#cc2229] text-white font-bold uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all min-w-[200px] justify-center h-[48px] text-sm"
            >
              {isViewingSolutions ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>View Solutions <span>→</span></>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}