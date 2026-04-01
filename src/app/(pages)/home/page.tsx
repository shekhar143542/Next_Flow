'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles, Zap, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Home Page - Krea.ai Style
 * 
 * Design Philosophy: Dark, modern AI platform
 * - Hero section with gradient background and call-to-action
 * - Feature cards showcasing key capabilities
 * - Smooth animations and hover effects
 * - Professional typography with Poppins for headings
 */

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663446314297/Nch4kvrUTjfALwLX29Brfj/krea-hero-bg-cRBscY6WLoT4nkViFuKnPW.webp';
const SAMPLE_IMAGE_1 = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663446314297/Nch4kvrUTjfALwLX29Brfj/krea-sample-image-1-CsfwQeix9LjoGBi3qdWPJQ.webp';
const SAMPLE_IMAGE_2 = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663446314297/Nch4kvrUTjfALwLX29Brfj/krea-sample-image-2-iDnmfv6SDMv4kKvNgxPwPU.webp';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      id: 'generate-image',
      title: 'Generate Image',
      description: 'Create stunning AI-generated images from text prompts',
      image: SAMPLE_IMAGE_1,
      icon: Sparkles,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'generate-video',
      title: 'Generate Video',
      description: 'Transform ideas into dynamic video content',
      image: SAMPLE_IMAGE_2,
      icon: Play,
      color: 'from-blue-500 to-purple-500',
    },
    {
      id: 'upscale-enhance',
      title: 'Upscale & Enhance',
      description: 'Enhance and upscale images with AI precision',
      image: SAMPLE_IMAGE_1,
      icon: Zap,
      color: 'from-pink-500 to-red-500',
    },
    {
      id: 'realtime',
      title: 'Realtime',
      description: 'Generate content in real-time with instant feedback',
      image: SAMPLE_IMAGE_2,
      icon: Sparkles,
      color: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pt-0">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden md:pt-24">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `url('${HERO_BG}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-8 animate-in fade-in duration-1000">
          <div className="space-y-4">
            <h1 className="font-poppins font-bold text-5xl md:text-6xl leading-tight">
              Start by generating a{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                free image
              </span>
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-inter">
              Harness the power of AI to create, enhance, and transform visual content with unprecedented ease and creativity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-inter font-semibold rounded-lg"
            >
              Generate Image
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-foreground/20 text-foreground hover:bg-foreground/5 font-inter font-semibold rounded-lg"
            >
              Generate Video
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-1000 delay-300">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isHovered = hoveredCard === feature.id;

              return (
                <div
                  key={feature.id}
                  onMouseEnter={() => setHoveredCard(feature.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-border transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 -z-10">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative p-6 h-64 flex flex-col justify-between">
                    {/* Icon Badge */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                      <h3 className="font-poppins font-bold text-xl text-foreground">
                        {feature.title}
                      </h3>
                      <p className="font-inter text-sm text-foreground/70">
                        {feature.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button className="w-full py-2 px-4 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground font-inter font-medium text-sm transition-all duration-200 transform group-hover:translate-x-1">
                      Try Now
                      <ArrowRight className="inline ml-2" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="font-poppins font-bold text-4xl md:text-5xl">
              Ready to create?
            </h2>
            <p className="text-lg text-foreground/70 font-inter">
              Join thousands of creators using Krea to bring their ideas to life.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-inter font-semibold rounded-lg"
          >
            Get Started Now
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </section>
    </main>
  );
}
