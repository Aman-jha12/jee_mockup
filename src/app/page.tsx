import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-lg ring-1 ring-slate-200">
        <h1 className="mb-3 text-3xl font-bold text-slate-900">JEE Mock Test</h1>
        <p className="mb-8 text-slate-600">Placeholder landing page</p>
        <Link
          href="/instructions"
          className="inline-flex rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
        >
          Start Test
        </Link>
      </section>
    </main>
  );
}
