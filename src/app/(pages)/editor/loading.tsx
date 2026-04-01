export default function Loading() {
  const skeletonCards = Array.from({ length: 8 });

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#0b0b0b] overflow-hidden z-50">
        <div
          style={{
            height: '100%',
            width: '35%',
            background:
              'linear-gradient(90deg, rgba(47,146,255,0), rgba(47,146,255,0.9), rgba(30,234,106,0.9), rgba(240,165,0,0.9))',
            animation: 'editor-loading 1.1s ease-in-out infinite',
          }}
        />
      </div>
      <div className="px-10 pt-24">
        <div className="h-6 w-52 rounded-full bg-white/10" />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {skeletonCards.map((_, index) => (
            <div
              key={`workflow-skeleton-${index}`}
              className="relative h-44 rounded-xl border border-[#1f1f1f] bg-[#121212] overflow-hidden"
            >
              <div className="absolute inset-0 shimmer-overlay" />
              <div className="absolute bottom-4 left-4 h-3 w-24 rounded-full bg-white/10" />
              <div className="absolute bottom-2 left-4 h-2 w-16 rounded-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes editor-loading {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-40%); opacity: 0.2; }
          50% { opacity: 0.6; }
          100% { transform: translateX(40%); opacity: 0.2; }
        }
        .shimmer-overlay {
          background-image: linear-gradient(
            90deg,
            rgba(255,255,255,0.02) 0%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.02) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
