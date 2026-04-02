"use client";

import Link from "next/link";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

const landingScreenshots = {
  hero: "/landing/editor-hero.png",
  stepDraft: "/landing/editor-hero.png",
  stepConnect: "/landing/node-llm.png",
  stepRun: "/landing/step-run.png",
};

const landingFeatureCards = [
  {
    title: "Text Node",
    description: "Seed prompts, constraints, or system instructions for downstream nodes.",
    image: "/landing/text.png",
    alt: "Text node editor screenshot",
    accent: "#f0a500",
    tone: "linear-gradient(135deg, rgba(240,165,0,0.18), rgba(240,165,0,0.02))",
  },
  {
    title: "Image Node",
    description: "Upload or connect visuals to feed into LLM, crop, or frame nodes.",
    image: "/landing/image.png",
    alt: "Image node editor screenshot",
    accent: "#2f92ff",
    tone: "linear-gradient(135deg, rgba(47,146,255,0.18), rgba(47,146,255,0.02))",
  },
  {
    title: "Video Node",
    description: "Bring video files into the canvas for extraction and analysis.",
    image: "/landing/video.png",
    alt: "Video node editor screenshot",
    accent: "#22c55e",
    tone: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.02))",
  },
  {
    title: "Frame Extractor",
    description: "Sample precise frames from video to feed into image-aware nodes.",
    image: "/landing/frame-extractor.png",
    alt: "Frame extractor node editor screenshot",
    accent: "#4f9bff",
    tone: "linear-gradient(135deg, rgba(79,155,255,0.18), rgba(79,155,255,0.02))",
  },
  {
    title: "LLM Node",
    description: "Run Gemini 2.5 Flash with text and image inputs in one place.",
    image: "/landing/llm.png",
    alt: "LLM node editor screenshot",
    accent: "#f39c4a",
    tone: "linear-gradient(135deg, rgba(243,156,74,0.18), rgba(243,156,74,0.02))",
  },
  {
    title: "Crop Image",
    description: "Isolate regions of interest before sending data to the next step.",
    image: "/landing/crop.png",
    alt: "Crop image node editor screenshot",
    accent: "#5bc0ff",
    tone: "linear-gradient(135deg, rgba(91,192,255,0.18), rgba(91,192,255,0.02))",
  },
];

const landingWorkflowSteps = [
  {
    step: "01",
    title: "Draft your flow",
    copy: "Drop text, image, crop, frame, and LLM nodes onto the canvas.",
    image: landingScreenshots.stepDraft,
    alt: "Empty workflow canvas",
    accent: "47,146,255",
  },
  {
    step: "02",
    title: "Connect intent",
    copy: "Wire outputs to inputs and preview how data travels between nodes.",
    image: landingScreenshots.stepConnect,
    alt: "Workflow canvas with connected nodes",
    accent: "240,165,0",
  },
  {
    step: "03",
    title: "Run + observe",
    copy: "Trigger a run, watch animations, and inspect output per node.",
    image: landingScreenshots.stepRun,
    alt: "Workflow canvas with output",
    accent: "34,197,94",
  },
];

const landingUseCases = [
  "Product photography pipelines with crops + upscales",
  "Storyboard generation with GPT prompts and visual branches",
  "Video frame extraction for dataset labeling",
  "Creative QA loops with fast LLM iterations",
];


export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .home-heading { font-family: 'Space Grotesk', 'Sora', sans-serif; }
        .home-body { font-family: 'IBM Plex Mono', 'Sora', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes lineFlow {
          0% { background-position: 0% 0%; }
          50% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        .timeline-line {
          background: linear-gradient(180deg, rgba(47,146,255,0), rgba(47,146,255,0.6), rgba(47,146,255,0));
          background-size: 100% 200%;
          animation: lineFlow 6s ease infinite;
        }
      `}</style>
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/98 backdrop-blur-md z-50 border-b border-gray-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-lg">
              K
            </div>
            <span className="font-bold text-lg">Krea</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition">
              App
            </a>
            <button className="text-gray-400 hover:text-white transition">
              Features
            </button>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Image
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Video
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Upscaler
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              API
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Pricing
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Enterprise
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/sign-up" className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-200">
              Sign up for free
            </Link>
            <Link href="/sign-in" className="text-gray-400 hover:text-white transition">
              Log in
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-gray-900/50 p-4 flex flex-col gap-4">
            <a href="#" className="text-gray-400 hover:text-white">
              App
            </a>
            <button className="text-gray-400 hover:text-white text-left">
              Features
            </button>
            <a href="#" className="text-gray-400 hover:text-white">
              Image
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Video
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Upscaler
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              API
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Pricing
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Enterprise
            </a>
            <Link href="/sign-up" className="w-full px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 text-center">
              Sign up for free
            </Link>
            <Link href="/sign-in" className="text-gray-400 hover:text-white">
              Log in
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section with Visible Background and Centered Dashboard */}
      <section className="relative min-h-screen pt-32 pb-20 px-4 text-center overflow-hidden flex flex-col items-center justify-center">
        {/* Background Layer - Visible Dark Landscape */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663446314297/hbH6vqZnuyK8WqSUu5JsCn/krea-hero-landscape-SAGLJ6qNBYrGo5iGYuZwfR.webp"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          {/* Subtle dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          {/* Text Content */}
          <div className="max-w-4xl mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-snug tracking-tight">
              Krea.ai is the world's most powerful creative AI suite.
            </h1>

            <p className="text-base md:text-lg text-gray-300 mb-12 font-normal">
              Generate, enhance, and edit images, videos, or 3D meshes for free with AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start for free
              </Link>
              <Link href="/home" className="px-8 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white/30 hover:border-white transition-all duration-300">
                Launch App
              </Link>
            </div>
          </div>

          {/* Dashboard Mockup - Smaller Centered */}
          <div className="relative w-full max-w-2xl">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700/50">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663446314297/hbH6vqZnuyK8WqSUu5JsCn/krea-dashboard-small-hs5CWJs2thnKHHMjf74652.webp"
                alt="Krea Dashboard"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Builder Overview */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(47,146,255,0.16), transparent 48%), radial-gradient(circle at 80% 0%, rgba(255,180,80,0.16), transparent 46%), radial-gradient(circle at 80% 80%, rgba(112,255,214,0.14), transparent 45%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.25,
          }}
        />

        <div className="relative max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div style={{ animation: "fadeUp 0.7s ease both" }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 home-body">
              <Sparkles size={14} />
              AI Workflow Builder
            </div>
            <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl leading-tight home-heading">
              Design, run, and iterate on AI workflows in minutes.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 home-body max-w-xl">
              A production-ready visual editor powered by React Flow and Trigger.dev. Build multimodal flows with Gemini 2.5 Flash, manage outputs, and ship faster.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/workflow"
                className="inline-flex items-center gap-2 rounded-full bg-[#2f92ff] px-6 py-3 text-sm font-semibold text-white transition-transform"
                style={{ boxShadow: "0 12px 30px rgba(47,146,255,0.35)" }}
              >
                Open Editor
                <ArrowRight size={16} />
              </a>
              <a
                href="/home"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:text-white"
              >
                View Templates
              </a>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { label: "Runtime", value: "Trigger.dev" },
                { label: "LLM", value: "Gemini 2.5 Flash" },
                { label: "Canvas", value: "React Flow" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40 home-body">{item.label}</div>
                  <div className="mt-2 text-sm font-semibold text-white home-heading">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative" style={{ animation: "fadeUp 0.9s ease both" }}>
            <div
              className="rounded-3xl border border-white/10 bg-[#10141d]/90 p-4"
              style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}
            >
              <div className="flex items-center justify-between text-xs text-white/50 home-body px-2 pb-3">
                <span>Workflow Preview</span>
                <span>Live editor</span>
              </div>
              <div
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/40"
                style={{ aspectRatio: "16 / 9" }}
              >
                <img
                  src={landingScreenshots.hero}
                  alt="Workflow editor preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 pb-24">
        <div className="pointer-events-none absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 md:block timeline-line opacity-70" />
        <div className="max-w-6xl mx-auto space-y-12">
          {landingWorkflowSteps.map((step, index) => {
            const isEven = index % 2 === 0;
            const imageColumn = isEven
              ? "md:col-start-1 md:col-end-2"
              : "md:col-start-3 md:col-end-4";
            const contentColumn = isEven
              ? "md:col-start-3 md:col-end-4"
              : "md:col-start-1 md:col-end-2";
            const imageAlign = isEven ? "md:justify-self-end" : "md:justify-self-start";
            const contentAlign = isEven ? "md:justify-self-start" : "md:justify-self-end";

            return (
              <div
                key={step.step}
                className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]"
                style={{ animation: `fadeUp 0.8s ease ${(index + 1) * 0.12}s both` }}
              >
                <div
                  className={`w-full max-w-[680px] rounded-[28px] border border-white/10 bg-[#0b0f17] p-4 ${imageColumn} ${imageAlign}`}
                  style={{ boxShadow: "0 24px 55px rgba(0,0,0,0.4)" }}
                >
                  <div
                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-2"
                    style={{ aspectRatio: "4 / 3" }}
                  >
                    <img
                      src={step.image}
                      alt={step.alt}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="relative hidden md:flex items-center justify-center md:col-start-2 md:col-end-3 md:self-center">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      background: `rgb(${step.accent})`,
                      boxShadow: `0 0 14px rgba(${step.accent},0.8)`,
                    }}
                  />
                </div>

                <div
                  className={`w-full max-w-[560px] rounded-[28px] border border-white/10 bg-white/5 p-6 ${contentColumn} ${contentAlign} ${index === 1 ? "md:-translate-y-[56px]" : ""}`}
                  style={{ borderColor: `rgba(${step.accent},0.25)` }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60 home-body">
                    Step {step.step}
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-white home-heading">{step.title}</div>
                  <p className="mt-3 text-sm text-white/70 home-body leading-relaxed">{step.copy}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/40 home-body">Capabilities</div>
              <h2 className="mt-3 text-3xl sm:text-4xl text-white home-heading">
                Everything you need to ship AI workflows.
              </h2>
            </div>
            <div className="text-sm text-white/60 home-body">Composable. Observable. Production ready.</div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {landingFeatureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
                style={{ background: feature.tone }}
              >
                <div
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f17] p-2"
                  style={{ aspectRatio: "4 / 5", boxShadow: "0 20px 45px rgba(0,0,0,0.4)" }}
                >
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-semibold text-white home-heading">{feature.title}</div>
                  <span
                    className="inline-flex h-2 w-2 rounded-full"
                    style={{ background: feature.accent, boxShadow: `0 0 10px ${feature.accent}` }}
                  />
                </div>
                <p className="mt-2 text-sm text-white/70 home-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 pb-20">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-white/40 home-body">Use cases</div>
            <h3 className="mt-3 text-2xl text-white home-heading">Deploy fast across teams.</h3>
            <ul className="mt-4 space-y-3">
              {landingUseCases.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/70 home-body">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#2f92ff]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-3xl border border-white/10 bg-[#111522] p-8"
            style={{
              backgroundImage: "linear-gradient(130deg, rgba(47,146,255,0.1), rgba(255,180,80,0.08), rgba(112,255,214,0.08))",
              backgroundSize: "200% 200%",
              animation: "shimmer 8s ease infinite",
            }}
          >
            <div className="text-xs uppercase tracking-[0.24em] text-white/40 home-body">Production readiness</div>
            <h3 className="mt-3 text-2xl text-white home-heading">Run confidently at scale.</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Retries + resilience", copy: "Automatic retries with deterministic run outputs." },
                { title: "Granular logs", copy: "Inspect each node output without leaving the canvas." },
                { title: "Secure secrets", copy: "Scoped keys and environment isolation by workflow." },
                { title: "Fast iteration", copy: "Quick add nodes, rerun only what changed." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white home-heading">{item.title}</div>
                  <p className="mt-2 text-xs text-white/60 home-body">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="text-xs uppercase tracking-[0.24em] text-white/40 home-body">Get started</div>
          <h2 className="mt-3 text-3xl sm:text-4xl text-white home-heading">Bring your next workflow to life.</h2>
          <p className="mt-4 text-sm text-white/70 home-body">
            Build, run, and ship AI pipelines with confidence. Start with a template or sketch from scratch.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="/workflow"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b0d12]"
            >
              Launch Editor
              <ArrowRight size={16} />
            </a>
            <a
              href="/editor"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
            >
              Explore Library
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
