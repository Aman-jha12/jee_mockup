"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExamResult } from "@/types/exam";

const RESULT_KEY = "jee_mock_exam_latest_result";

export default function ResultPage() {
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(RESULT_KEY);
    if (raw) setResult(JSON.parse(raw) as ExamResult);
  }, []);

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#131315]">
        <div className="rounded-xl bg-[#201f22] p-8 text-center shadow ring-1 ring-white/10">
          <p className="mb-4 text-[#e5e1e4]">No result found yet.</p>
          <Link href="/" className="rounded-md bg-[#bc13fe] px-4 py-2 text-white">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const totalQuestions = result.attempted + result.unattempted;
  const accuracy = result.attempted > 0 ? Math.round((result.correct / result.attempted) * 100) : 0;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Be+Vietnam+Pro:wght@300;400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .font-body-md { font-family: 'Be Vietnam Pro', sans-serif; font-size: 16px; line-height: 1.6; font-weight: 400; }
        .font-headline-lg { font-family: 'Space Grotesk', sans-serif; font-size: 48px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 700; }
        .font-label-bold { font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1; font-weight: 700; }
        .font-display-xl { font-family: 'Space Grotesk', sans-serif; font-size: 80px; line-height: 1.1; letter-spacing: -0.04em; font-weight: 700; }
        .font-headline-md { font-family: 'Space Grotesk', sans-serif; font-size: 32px; line-height: 1.3; font-weight: 600; }

        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .neon-glow-purple {
            box-shadow: 0 0 20px rgba(188, 19, 254, 0.4);
        }
        .neon-glow-lime {
            box-shadow: 0 0 20px rgba(186, 246, 0, 0.3);
        }
        .gradient-bg {
            background: radial-gradient(circle at 0% 0%, rgba(188, 19, 254, 0.15) 0%, transparent 40%),
                        radial-gradient(circle at 100% 100%, rgba(0, 219, 233, 0.1) 0%, transparent 40%),
                        #08080A;
        }
        .text-glow {
            text-shadow: 0 0 10px rgba(188, 19, 254, 0.5);
        }
      `}</style>
      <div className="bg-[#131315] text-[#e5e1e4] font-body-md min-h-screen gradient-bg p-6 md:p-12 dark">
        <main className="max-w-6xl mx-auto space-y-12">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <p className="text-[#ebb2ff] font-label-bold tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span> PERFORMANCE SUMMARY
              </p>
              <h1 className="font-headline-lg text-white">Your Scores</h1>
              <p className="text-[#d4c0d7] font-body-md opacity-70 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Submitted on {new Date(result.submittedAt).toLocaleString()}
              </p>
            </div>
            <button className="group flex items-center gap-3 bg-[#baf600] text-[#151f00] px-8 py-4 rounded-full font-label-bold hover:scale-105 active:scale-95 transition-all neon-glow-lime shadow-2xl">
              <span className="material-symbols-outlined">share</span>
              Share Result
            </button>
          </header>

          {/* Main Score Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hero Score Card */}
            <div className="lg:col-span-5 glass-card rounded-lg p-10 flex flex-col items-center justify-center relative overflow-hidden group">
              {/* Background Decorative Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#bc13fe]/20 blur-[80px] rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#00dbe9]/10 blur-[80px] rounded-full"></div>
              <div className="relative">
                {/* Score Circle Visualization */}
                <div className="w-64 h-64 rounded-full border-[12px] border-[#bc13fe]/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-[12px] border-[#bc13fe] border-t-transparent -rotate-45 neon-glow-purple"></div>
                  <div className="text-center">
                    <p className="text-[#d4c0d7] font-label-bold opacity-60">TOTAL SCORE</p>
                    <span className="font-display-xl text-white text-glow leading-none">{result.totalScore}</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-8 w-full text-center">
                <div>
                  <p className="text-[#d4c0d7] font-label-bold opacity-60">RANK</p>
                  <p className="font-headline-md text-white">#142</p>
                </div>
                <div>
                  <p className="text-[#d4c0d7] font-label-bold opacity-60">PERCENTILE</p>
                  <p className="font-headline-md text-[#ebb2ff]">82.4%</p>
                </div>
              </div>
            </div>

            {/* Stats Breakdown Card */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attempted Stat */}
              <div className="glass-card rounded-lg p-8 flex flex-col justify-between hover:border-[#bc13fe]/40 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="bg-[#bc13fe]/10 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-[#bc13fe]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_square</span>
                  </div>
                  <span className="text-[#d4c0d7] font-label-bold">{result.attempted}/{totalQuestions}</span>
                </div>
                <div>
                  <h3 className="text-[#d4c0d7] font-label-bold opacity-60">Attempted</h3>
                  <p className="font-headline-md text-white">{result.attempted}</p>
                </div>
              </div>

              {/* Unattempted Stat */}
              <div className="glass-card rounded-lg p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="bg-[#353437] p-3 rounded-lg">
                    <span className="material-symbols-outlined text-[#d4c0d7]">pending</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-[#d4c0d7] font-label-bold opacity-60">Unattempted</h3>
                  <p className="font-headline-md text-white">{result.unattempted}</p>
                </div>
              </div>

              {/* Correct Stat */}
              <div className="glass-card rounded-lg p-8 border-l-4 border-l-[#baf600] flex flex-col justify-between hover:border-[#baf600]/40 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="bg-[#baf600]/10 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-[#baf600]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <span className="text-[#baf600] font-label-bold">ACCURACY {accuracy}%</span>
                </div>
                <div>
                  <h3 className="text-[#d4c0d7] font-label-bold opacity-60">Correct Answers</h3>
                  <p className="font-headline-md text-[#baf600]">{result.correct}</p>
                </div>
              </div>

              {/* Wrong Stat */}
              <div className="glass-card rounded-lg p-8 border-l-4 border-l-[#ffb4ab] flex flex-col justify-between hover:border-[#ffb4ab]/40 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="bg-[#ffb4ab]/10 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffb4ab]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-[#d4c0d7] font-label-bold opacity-60">Wrong Answers</h3>
                  <p className="font-headline-md text-[#ffb4ab]">{result.wrong}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Wise Insights */}
          <section className="space-y-6">
            <h2 className="font-headline-md text-white flex items-center gap-4">
              Subject Insights
              <div className="h-[1px] flex-grow bg-gradient-to-r from-[#bc13fe]/50 to-transparent"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(result.subjectWise).map(([subject, summary]) => {
                const isMath = subject.toLowerCase() === "mathematics";
                const isPhysics = subject.toLowerCase() === "physics";
                const isChemistry = subject.toLowerCase() === "chemistry";
                const icon = isMath ? "functions" : isPhysics ? "bolt" : "science";

                return (
                  <div key={subject} className={`glass-card rounded-lg p-6 group hover:-translate-y-1 transition-all relative overflow-hidden ${summary.attempted === 0 ? "border-l-4 border-l-white/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100" : ""}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <span className="material-symbols-outlined text-[64px]">{icon}</span>
                    </div>
                    <h3 className="font-headline-md text-white mb-6 capitalize">{subject}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[#d4c0d7] opacity-70">Subject Score</span>
                        <span className={`font-label-bold ${summary.score > 0 ? "text-[#ebb2ff]" : "text-white"}`}>{summary.score}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[#d4c0d7] opacity-70">Attempted</span>
                        <span className="font-label-bold text-white">{summary.attempted}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[#d4c0d7] opacity-70">Unattempted</span>
                        <span className="font-label-bold text-white">{summary.unattempted}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        {summary.attempted > 0 ? (
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#baf600]"></span>
                              <span className="text-[12px] text-[#baf600] font-bold">{summary.correct} COR</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
                              <span className="text-[12px] text-[#ffb4ab] font-bold">{summary.wrong} WRO</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#d4c0d7] italic">No activity recorded</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Aesthetic Banner */}
          <section className="glass-card rounded-xl p-1 overflow-hidden">
            <div className="bg-[#201f22] rounded-lg p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[#bc13fe]/10 to-transparent pointer-events-none"></div>
              <img className="w-32 h-32 rounded-lg object-cover neon-glow-purple border-2 border-[#bc13fe]/50" alt="Tech Lab" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxK0RatWmUBoyug6You9pK5NqGE7uAwkBfB740ewjX5yYTSQv80Q9egNueCfcKoIMbUZhcHdXF8rJtshPvTX90cdeEMVHb70ZPCY-NFMwdm1xA-RCJMNpaCroKrAX9VS1TZVJMoFkymqJUt_K1wZ7zXOcwpA9QmEUiRZfyH9swIVW-JwcxXZ9X1kiBhmuewZotVp1m08SkaAfemCKmcZ1CZzIYaNf4Qutw-QYw8mhB6T3lgBRJYthjnhwdedEsE0aPAZP774yRCa3Z" />
              <div className="flex-grow space-y-2 text-center md:text-left z-10">
                <h4 className="font-headline-md text-white">Ready for your glow up?</h4>
                <p className="text-[#d4c0d7] font-body-md max-w-xl">You've got the basics down, but there's room to dominate. Mathematics is your strong suit—let's double down on Physics and Chemistry to sweep the board next time.</p>
              </div>
              <button className="bg-white text-[#131315] px-8 py-4 rounded-lg font-label-bold hover:bg-[#bc13fe] hover:text-white transition-all active:scale-95 whitespace-nowrap z-10">
                Review Mistakes
              </button>
            </div>
          </section>
        </main>

        {/* Footer Floating Accent */}
        <footer className="mt-24 text-center pb-12 opacity-30">
          <p className="font-label-bold tracking-widest text-[12px]">EDULYTICS ENGINE V2.0 // SYNCED</p>
        </footer>
      </div>
    </>
  );
}
