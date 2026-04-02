'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
          AI Workflow Builder
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold">Welcome to Nextflow</h1>
        <p className="text-sm sm:text-base text-white/70">
          The product overview now lives on the landing page. Jump into the editor to start building workflows.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
          >
            View Landing
          </Link>
          <Link
            href="/workflow"
            className="inline-flex items-center gap-2 rounded-full bg-[#2f92ff] px-6 py-3 text-sm font-semibold text-white"
          >
            Open Editor
          </Link>
        </div>
      </div>
    </main>
  );
}
