export default function WhiteFuturisticScanOverlay() {
  return (
    <>
      <style>{`
        @keyframes pureScan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          15% { opacity: 0.3; }
          85% { opacity: 0.3; }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @keyframes ghostScan {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          15% { opacity: 0.15; }
          85% { opacity: 0.15; }
          100% {
            transform: translateY(-100%);
            opacity: 0;
          }
        }

        @keyframes etherealDistort {
          0%, 100% {
            filter: blur(0px) brightness(1);
          }
          25% {
            filter: blur(0.8px) brightness(1.1);
          }
          50% {
            filter: blur(0.4px) brightness(1.05);
          }
          75% {
            filter: blur(0.6px) brightness(1.08);
          }
        }

        @keyframes spectrumBloom {
          0% {
            opacity: 0.05;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.12;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.05;
            transform: scale(0.95);
          }
        }

        @keyframes prismaticShift {
          0% {
            background-position: 0% 0%;
            opacity: 0.03;
          }
          100% {
            background-position: 100% 100%;
            opacity: 0.06;
          }
        }

        @keyframes quantumPulse {
          0% {
            box-shadow: 
              0 0 10px rgba(255, 255, 255, 0.1),
              0 0 20px rgba(255, 255, 255, 0.05),
              inset 0 0 30px rgba(255, 255, 255, 0.02);
          }
          50% {
            box-shadow: 
              0 0 15px rgba(255, 255, 255, 0.15),
              0 0 30px rgba(255, 255, 255, 0.08),
              inset 0 0 45px rgba(255, 255, 255, 0.03);
          }
          100% {
            box-shadow: 
              0 0 10px rgba(255, 255, 255, 0.1),
              0 0 20px rgba(255, 255, 255, 0.05),
              inset 0 0 30px rgba(255, 255, 255, 0.02);
          }
        }

        @keyframes etherealGrid {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }

        @keyframes hologramLines {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes spectralGlow {
          0%, 100% { opacity: 0.02; }
          50% { opacity: 0.08; }
        }

        @keyframes etherealFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes crystalRefraction {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">

        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.01) 0%,
                rgba(255, 255, 255, 0.02) 50%,
                rgba(255, 255, 255, 0.01) 100%
              )
            `,
            animation: 'prismaticShift 8s ease-in-out infinite',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'etherealGrid 20s linear infinite',
            mixBlendMode: 'soft-light',
          }}
        />

        <div
          className="absolute left-0 w-full h-px"
          style={{
            animation: 'pureScan 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            background: `
              linear-gradient(
                to right,
                transparent,
                rgba(255, 255, 255, 0.8) 20%,
                rgba(255, 255, 255, 0.9) 50%,
                rgba(255, 255, 255, 0.8) 80%,
                transparent
              )
            `,
            boxShadow: `
              0 0 40px rgba(255, 255, 255, 0.2),
              0 0 80px rgba(255, 255, 255, 0.1)
            `,
            filter: 'blur(0.3px)',
          }}
        />

        <div
          className="absolute left-0 w-full h-0.5"
          style={{
            animation: 'ghostScan 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.4s',
            background: `
              linear-gradient(
                to right,
                transparent,
                rgba(255, 255, 255, 0.4) 15%,
                rgba(255, 255, 255, 0.4) 85%,
                transparent
              )
            `,
            filter: 'blur(1px)',
            mixBlendMode: 'plus-lighter',
            opacity: 0.2,
          }}
        />

        <div
          className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: 'spectrumBloom 3s ease-in-out infinite',
            background: `
              radial-gradient(
                circle at center,
                rgba(255, 255, 255, 0.1) 0%,
                rgba(255, 255, 255, 0.05) 30%,
                transparent 70%
              )
            `,
            mixBlendMode: 'overlay',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            animation: 'crystalRefraction 6s ease-in-out infinite',
            background: `
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.02) 0%,
                rgba(255, 255, 255, 0.04) 25%,
                rgba(255, 255, 255, 0.02) 50%,
                rgba(255, 255, 255, 0.04) 75%,
                rgba(255, 255, 255, 0.02) 100%
            )`,
            backgroundSize: '200% 100%',
            mixBlendMode: 'soft-light',
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <path
            d="M0,100 L300,50 L600,150 L900,75 L1200,125 L1600,100"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
            fill="none"
            style={{
              strokeDasharray: '1000',
              strokeDashoffset: '1000',
              animation: 'hologramLines 4s ease-out forwards 0.6s',
              filter: 'blur(0.5px)',
            }}
          />
          <path
            d="M0,200 L400,150 L800,250 L1200,175 L1600,225"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="0.5"
            fill="none"
            style={{
              strokeDasharray: '1000',
              strokeDashoffset: '1000',
              animation: 'hologramLines 5s ease-out forwards 0.8s',
              filter: 'blur(1px)',
            }}
          />
        </svg>

        <div
          className="absolute inset-0"
          style={{
            animation: 'etherealDistort 4s ease-in-out infinite',
            background: `
              radial-gradient(
                ellipse at 30% 40%,
                rgba(255, 255, 255, 0.04) 0%,
                transparent 50%
              ),
              radial-gradient(
                ellipse at 70% 60%,
                rgba(255, 255, 255, 0.03) 0%,
                transparent 50%
              )
            `,
            mixBlendMode: 'soft-light',
          }}
        />

        <div
          className="absolute inset-4 rounded-xl"
          style={{
            animation: 'quantumPulse 5s ease-in-out infinite',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        />

        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `etherealFloat ${2 + Math.random() * 3}s ease-in-out infinite ${i * 0.1}s`,
                background: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
                filter: 'blur(0.5px)',
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        <div
          className="absolute w-[150%] h-px -rotate-45 origin-center"
          style={{
            animation: 'pureScan 1.8s linear forwards 0.3s',
            background: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 8px,
                rgba(255, 255, 255, 0.2) 9px,
                rgba(255, 255, 255, 0.2) 10px
              )
            `,
            mixBlendMode: 'screen',
            filter: 'blur(0.3px)',
            opacity: 0.2,
          }}
        />

        <div
          className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: 'spectralGlow 4s ease-in-out infinite 1s',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        <div className="absolute top-3 left-3 flex items-center gap-2 opacity-40">
          <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
          <div className="text-xs font-mono text-white tracking-wider">
            <span className="opacity-60">AI MODE</span>
            <span className="opacity-40">:</span>
            <span className="opacity-80"> ACTIVE</span>
          </div>
        </div>

        <div className="absolute bottom-3 right-3 text-xs font-mono text-white opacity-30">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-white" />
            <span className="opacity-60">YOUR ASSISTANT</span>
            <span className="opacity-40">:</span>
            <span className="opacity-80"> 100%</span>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-8 h-8">
          <div className="absolute top-0 left-0 w-4 h-px bg-white opacity-20" />
          <div className="absolute top-0 left-0 h-4 w-px bg-white opacity-20" />
        </div>
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-0 right-0 w-4 h-px bg-white opacity-20" />
          <div className="absolute top-0 right-0 h-4 w-px bg-white opacity-20" />
        </div>

      </div>
    </>
  )
}