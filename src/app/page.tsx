import Link from "next/link";
import { ReactNode } from "react";
import { Bolt, LockKeyhole, Settings, UserCircle2, Headset } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05030a] text-white selection:bg-[#8455ef] selection:text-white">
      <nav className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-white/5 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-violet-600 to-indigo-400 bg-clip-text text-xl font-black tracking-tighter text-transparent">
            SecureAssess
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a className="text-sm font-medium text-slate-400 transition-colors hover:text-violet-400" href="#">
            Dashboard
          </a>
          <a className="text-sm font-medium text-slate-400 transition-colors hover:text-violet-400" href="#">
            Guidelines
          </a>
          <a className="text-sm font-medium text-slate-400 transition-colors hover:text-violet-400" href="#">
            Support
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 transition-colors hover:text-violet-400" type="button">
            <Settings size={20} />
          </button>
          <button className="text-slate-400 transition-colors hover:text-violet-400" type="button">
            <UserCircle2 size={22} />
          </button>
        </div>
      </nav>

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

        <div className="relative z-10 w-full max-w-lg">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500/40 to-blue-500/40 p-[1px] shadow-[0_0_80px_rgba(107,56,212,0.15)]">
            <div className="rounded-3xl border border-white/10 bg-[rgba(13,10,25,0.8)] p-10 backdrop-blur-[40px]">
              <div className="mb-10 text-center">
                <span className="mb-4 inline-block rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                  Authorized Access Only
                </span>
                <h1 className="mb-2 text-5xl font-bold tracking-tight text-white">Final Certification</h1>
                <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 opacity-60" />
                <p className="mt-6 text-base font-light leading-relaxed text-slate-400">
                  Verify your credentials to initialize the secure exam environment. All activities are
                  monitored by the SecureAssess AI.
                </p>
              </div>

              <div className="mb-10 w-full space-y-6">
                <div className="group relative">
                  <label className="absolute -top-3 left-4 z-20 bg-[#0d0a19] px-2 text-[10px] font-bold uppercase tracking-widest text-violet-200 transition-colors group-focus-within:text-blue-400">
                    Access Code
                  </label>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-focus-within:border-violet-400/50 group-focus-within:shadow-[0_0_20px_rgba(107,56,212,0.15)]">
                    <input
                      className="w-full border-none bg-transparent px-6 py-5 font-mono tracking-wider text-white placeholder:text-slate-600 focus:ring-0"
                      placeholder="erw"
                      type="text"
                    />
                  </div>
                </div>
                <div className="group relative">
                  <label className="absolute -top-3 left-4 z-20 bg-[#0d0a19] px-2 text-[10px] font-bold uppercase tracking-widest text-violet-200 transition-colors group-focus-within:text-blue-400">
                    Candidate ID
                  </label>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-focus-within:border-violet-400/50 group-focus-within:shadow-[0_0_20px_rgba(107,56,212,0.15)]">
                    <input
                      className="w-full border-none bg-transparent px-6 py-5 text-white placeholder:text-slate-600 focus:ring-0"
                      placeholder="••••••••••••"
                      type="password"
                    />
                  </div>
                </div>
              </div>

              <Link
                href="/instructions"
                className="group relative inline-flex w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-5 text-lg font-bold tracking-wide text-white shadow-[0_10px_30px_rgba(33,112,228,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(33,112,228,0.4)] active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute -left-[70%] top-[-60%] h-[200%] w-[60%] rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-500 group-hover:left-[120%]" />
                <span className="relative z-10 flex w-full items-center justify-center gap-2">
                  Start Your Exam
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>

              <div className="mt-12 flex w-full items-center justify-between border-t border-white/5 pt-8">
                <FeatureItem icon={<LockKeyhole size={18} />} label="Proctor Secured" />
                <FeatureItem icon={<Bolt size={18} />} label="Low Latency" />
                <FeatureItem icon={<Headset size={18} />} label="Live Support" />
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs font-light text-slate-500">
            By entering the code, you agree to the{" "}
            <a className="text-violet-400 hover:underline" href="#">
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

function FeatureItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="group flex flex-col items-center gap-2">
      <span className="text-slate-500 transition-colors group-hover:text-violet-400">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-tight text-slate-500">{label}</span>
    </div>
  );
}
