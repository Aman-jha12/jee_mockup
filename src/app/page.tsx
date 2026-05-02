import Link from "next/link";
import { Settings, UserCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05030a] text-white selection:bg-[#8455ef] selection:text-white">
      <div className="absolute left-0 top-0 z-50 flex w-full items-center justify-between px-6 py-6 md:px-12">
        <div className="flex h-14 w-40 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
          <span className="text-xs font-bold tracking-widest text-slate-400">LOGO 1</span>
        </div>
        <div className="flex h-14 w-40 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
          <span className="text-xs font-bold tracking-widest text-slate-400">LOGO 2</span>
        </div>
      </div>

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-28 pt-24 md:px-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a061a] via-[#05030a] to-[#020105]" />
          <div
            className="absolute inset-0 opacity-15 grayscale"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD66mNaJ5VfgcLUgg0P2_dUh9AauuNGPNd3C1rEwl30j8vMIoGYOGaU8m_PBK3gJFbJhL7wNhvvf1X3_ty3rl_KUpN8-ZCFTX4fe5n9mNMnY3arUx4j699hf8YQJ8tottty1oORFtMru_X7-yPkQvnYAyZk8u4_P04UhnjBKgDuDrNqsG3Yx13F-qgKJgHq7cqA7FxmYjqU5u9md7WKDfEGCOlQoIM6SgO167pht80n7fWJuslDEKL__AZkJJpx-_m_4kCg1CdeAGk")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
        </div>

        <div className="animate-fade-in-up relative z-10 w-full max-w-3xl">
          <div className="gradient-border-glow animate-float relative overflow-hidden rounded-[2rem] border border-white/10">
            <div className="reflection-layer" />
            <div className="glass-panel p-10">
              <div className="mb-10 flex flex-col items-center text-center">
                <h1 className="font-h2 mb-2 text-4xl font-bold tracking-tight text-white md:text-5xl">Pre-Exam Portal</h1>
                <div className="gradient-underline mb-4 mt-4 h-1 w-20 rounded-full opacity-90" />
                <p className="mx-auto max-w-md text-base font-normal leading-relaxed text-slate-300/80">
                  Complete your profile to unlock the entrance assessment platform.
                </p>
              </div>

              <form className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="ml-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-300/80">
                    Full Name
                  </label>
                  <div className="input-glow relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300">
                    <input
                      className="w-full border-none bg-transparent px-4 py-3.5 font-medium text-white placeholder:text-slate-400/40 focus:ring-0"
                      placeholder="Abhay Kumar"
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="ml-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-300/80">
                    Mobile Number
                  </label>
                  <div className="input-glow relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300">
                    <input
                      className="w-full border-none bg-transparent px-4 py-3.5 font-medium text-white placeholder:text-slate-400/40 focus:ring-0"
                      placeholder="+91 9876543210"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="ml-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-300/80">
                    Email Address
                  </label>
                  <div className="input-glow relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300">
                    <input
                      className="w-full border-none bg-transparent px-4 py-3.5 font-medium text-white placeholder:text-slate-400/40 focus:ring-0"
                      placeholder="abhay.kumar@example.com"
                      type="email"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="ml-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-300/80">
                    Class Status
                  </label>
                  <div className="input-glow relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300">
                    <select className="w-full appearance-none border-none bg-transparent px-4 py-3.5 font-medium text-white focus:ring-0">
                      <option className="bg-[#05030a] text-white">Currently in 12th</option>
                      <option className="bg-[#05030a] text-white">Passed 12th</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="ml-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-300/80">
                    Stream in Class 12
                  </label>
                  <div className="input-glow relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300">
                    <select className="w-full appearance-none border-none bg-transparent px-4 py-3.5 font-medium text-white focus:ring-0">
                      <option className="bg-[#05030a] text-white">Science</option>
                      <option className="bg-[#05030a] text-white">Commerce</option>
                      <option className="bg-[#05030a] text-white">Arts</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="ml-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-300/80">
                    City
                  </label>
                  <div className="input-glow relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300">
                    <input
                      className="w-full border-none bg-transparent px-4 py-3.5 font-medium text-white placeholder:text-slate-400/40 focus:ring-0"
                      placeholder="San Francisco"
                      type="text"
                    />
                  </div>
                </div>
              </form>

              <div className="space-y-8">
                <div className="group relative w-full">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 opacity-40 blur-md transition duration-500 group-hover:opacity-80 group-hover:blur-lg" />
                  <Link
                    href="/instructions"
                    className="shimmer-sweep relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-[#7c4dff] to-blue-600 px-6 py-5 text-lg font-bold tracking-wide text-white shadow-[0_0_20px_rgba(107,56,212,0.3)] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(107,56,212,0.5)] active:scale-[0.98]"
                  >
                    Start Your Exam
                    <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
                  </Link>
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between font-semibold uppercase tracking-[0.05em] text-slate-300/80">
                    <span>Step 1 of 2</span>
                    <span>50% Complete</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 shadow-[0_0_10px_rgba(107,56,212,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-[11px] font-medium uppercase tracking-wide text-slate-600">
            By entering the code, you agree to the{" "}
            <a className="text-violet-400 underline decoration-violet-400/30 underline-offset-4 transition-colors hover:text-violet-300" href="#">
              Assessment Honor Code
            </a>
            .
          </p>
        </div>
      </main>

      <footer className="fixed bottom-0 z-50 flex w-full items-center justify-between bg-transparent px-6 py-6 md:px-12">
        <div>
          <span className="text-[10px] font-light uppercase tracking-wide text-slate-400">
            © 2024 SecureAssess Systems. All Rights Reserved.
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-light uppercase tracking-wide text-slate-400">
              System Status: Operational
            </span>
          </div>
          <a className="text-[10px] font-light uppercase tracking-wide text-slate-400 transition-colors hover:text-violet-300" href="#">
            Privacy Policy
          </a>
          <a className="text-[10px] font-light uppercase tracking-wide text-slate-400 transition-colors hover:text-violet-300" href="#">
            Security Protocol
          </a>
        </div>
      </footer>
    </div>
  );
}
