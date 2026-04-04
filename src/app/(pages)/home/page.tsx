'use client';

import Link from 'next/link';

const metrics = [
  { label: 'Workflows', value: '—', note: 'Create your first workflow to see totals.' },
  { label: 'Runs', value: '—', note: 'Run a workflow to see activity.' },
  { label: 'Success rate', value: '—', note: 'Available after runs complete.' },
  { label: 'Avg latency', value: '—', note: 'Measured once executions start.' },
];

const templates = [
  { title: 'E-commerce Image Kit', desc: 'Crop, upscale, and caption product shots.' },
  { title: 'Storyboard Builder', desc: 'Extract frames and summarize each scene.' },
  { title: 'Multimodal QA', desc: 'Analyze visuals + copy with Gemini.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070910] text-white px-6 pb-16 pt-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .dash-shell { --accent: #2f92ff; --accent-warm: #f0a500; --accent-cool: #22c55e; }
        .dash-heading { font-family: 'Space Grotesk', 'Sora', sans-serif; }
        .dash-body { font-family: 'IBM Plex Mono', 'Sora', sans-serif; }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 0.6; transform: translateY(-6px); }
        }
      `}</style>

      <div className="dash-shell max-w-6xl mx-auto">
        <div
          className="rounded-[32px] border border-white/10 bg-[#0c111b]/80 p-8 md:p-10"
          style={{
            boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(47,146,255,0.18), transparent 55%), radial-gradient(circle at 85% 0%, rgba(240,165,0,0.12), transparent 50%)',
          }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 dash-body">
                Workspace Dashboard
              </div>
              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl dash-heading">
                Welcome back to Nextflow.
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/70 dash-body max-w-xl">
                Track active runs, jump into recent workflows, and keep momentum with quick actions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/workflow"
                className="inline-flex items-center gap-2 rounded-full bg-[#2f92ff] px-6 py-3 text-sm font-semibold text-white"
              >
                Open Editor
              </Link>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
              >
                Templates
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-white/40 dash-body">{metric.label}</div>
                <div className="mt-3 text-2xl font-semibold dash-heading">{metric.value}</div>
                <div className="mt-2 text-xs text-white/60 dash-body">{metric.note}</div>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0c111b]/80 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl dash-heading">Recent workflows</h2>
                <span className="text-xs text-white/50 dash-body">Updated live</span>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60 dash-body">
                No workflows yet. Create one in the editor to see it here.
              </div>
              <Link href="/workflow" className="mt-4 inline-flex text-xs font-semibold text-[#2f92ff] dash-body">
                Create a workflow →
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c111b]/80 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl dash-heading">Active runs</h2>
                <span className="text-xs text-white/50 dash-body">Waiting for activity</span>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60 dash-body">
                No runs yet. Trigger a workflow run to track progress here.
              </div>
              <Link href="/workflow" className="mt-4 inline-flex text-xs font-semibold text-[#2f92ff] dash-body">
                Run a workflow →
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c111b]/80 p-6">
              <h2 className="text-xl dash-heading">Suggested templates</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {templates.map((template) => (
                  <div key={template.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold dash-heading">{template.title}</div>
                    <p className="mt-2 text-xs text-white/60 dash-body">{template.desc}</p>
                    <button className="mt-4 text-xs font-semibold text-[#2f92ff] dash-body">Use template →</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0c111b]/80 p-6">
              <h2 className="text-xl dash-heading">Usage</h2>
              <p className="mt-2 text-xs text-white/60 dash-body">Usage data appears after your first run.</p>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-full w-[0%] rounded-full bg-[#2f92ff]" />
              </div>
              <div className="mt-3 text-xs text-white/60 dash-body">No usage recorded yet.</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c111b]/80 p-6 relative overflow-hidden">
              <div
                className="absolute right-6 top-6 h-16 w-16 rounded-full"
                style={{ background: 'rgba(47,146,255,0.2)', animation: 'glowPulse 5s ease infinite' }}
              />
              <h2 className="text-xl dash-heading">Tip of the day</h2>
              <p className="mt-3 text-sm text-white/70 dash-body">
                Use the quick actions in the sidebar to drop new nodes without leaving the canvas.
              </p>
              <Link href="/workflow" className="mt-4 inline-flex text-xs font-semibold text-[#2f92ff] dash-body">
                Go to canvas →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
