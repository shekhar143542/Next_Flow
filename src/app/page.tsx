"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";


export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const models = [
    { name: "Veo 3.1", icon: "🎬" },
    { name: "Ideogram", icon: "📝" },
    { name: "Runway", icon: "🎞️" },
    { name: "Luma", icon: "✨" },
    { name: "Flux", icon: "⚡" },
  ];

  const features = [
    {
      title: "Industry-leading inference speed",
      subtitle: "3s for 1024px Flux image",
      icon: "⚡",
    },
    {
      title: "22K Photo upscaling",
      subtitle: "Ultra-fine detail enhancement",
      icon: "🖼️",
    },
    {
      title: "4K Native rendering",
      subtitle: "High-resolution generation",
      icon: "🎬",
    },
    {
      title: "Train",
      subtitle: "Fine-tune models with your data",
      icon: "🧠",
    },
    {
      title: "Minimalist UI",
      subtitle: "Simple, intuitive interface",
      icon: "🎨",
    },
    {
      title: "Bleeding Edge",
      subtitle: "Always latest AI models",
      icon: "🚀",
    },
    {
      title: "1000+ Styles",
      subtitle: "Diverse creative options",
      icon: "🎭",
    },
    {
      title: "Image Editor",
      subtitle: "Generative editing tools",
      icon: "✏️",
    },
    {
      title: "Lipsync",
      subtitle: "AI-powered video sync",
      icon: "🎤",
    },
    {
      title: "Text to 3D",
      subtitle: "Generate 3D models",
      icon: "🎲",
    },
  ];

  const brands = [
    { name: "Samsung", icon: "📱" },
    { name: "Nike", icon: "👟" },
    { name: "Microsoft", icon: "🪟" },
    { name: "Shopify", icon: "🛍️" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
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

      {/* Models Section */}
      <section className="py-32 px-4 border-t border-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              The industry's best
            </h2>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Generative models.
            </h2>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-600 leading-tight">
              In one subscription.
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 lg:gap-20">
            {models.map((model) => (
              <div key={model.name} className="flex flex-col items-center gap-3 hover:opacity-80 transition">
                <div className="text-5xl">{model.icon}</div>
                <span className="text-sm font-semibold text-gray-400">
                  {model.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-32 px-4 border-t border-gray-900/50">
        <div className="container mx-auto">
          <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">Use cases</p>
          <h2 className="text-5xl md:text-6xl font-bold mb-20 leading-tight">
            Generate or edit high quality images, videos, and 3D objects with AI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-950/50 border border-gray-800/50 rounded-2xl p-8 hover:bg-gray-900/50 hover:border-gray-700 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-4xl mb-6 group-hover:scale-125 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-32 px-4 border-t border-gray-900/50">
        <div className="container mx-auto text-center">
          <p className="text-gray-600 text-sm mb-6 uppercase tracking-wider">
            A tool suite for pros and beginners alike
          </p>
          <h2 className="text-5xl md:text-6xl font-bold mb-16 leading-tight">
            Krea powers millions of creatives, enterprises, and everyday people.
          </h2>

          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {brands.map((brand) => (
              <div key={brand.name} className="flex items-center gap-3 hover:opacity-80 transition">
                <span className="text-3xl">{brand.icon}</span>
                <span className="font-semibold text-gray-400">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 border-t border-gray-900/50">
        <div className="container mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/sign-up" className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">Sign up for free</Link>
            <button className="px-10 py-4 bg-transparent text-white font-bold rounded-full border-2 border-gray-700 hover:border-white transition-all duration-300">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900/50 py-16 px-4 bg-black/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Gallery
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Image Generator
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Video Generator
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Enterprise
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-900/50 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2026 Krea. All rights reserved.</p>
            <div className="flex gap-8 mt-4 sm:mt-0">
              <a href="#" className="hover:text-gray-300 transition">
                Twitter
              </a>
              <a href="#" className="hover:text-gray-300 transition">
                Discord
              </a>
              <a href="#" className="hover:text-gray-300 transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
