import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Trophy, Medal, Award, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankCelebrationProps {
  rank: 1 | 2 | 3;
  onDismiss: () => void;
}

const rankConfig = {
  1: {
    label: "1st Place!",
    sub: "You're leading the chapter 🎉",
    Icon: Trophy,
    gradient: "from-yellow-300 via-amber-400 to-yellow-500",
    iconColor: "text-yellow-50",
    colors: ["#FFD700", "#FFA500", "#FFEC8B", "#FFFFFF"],
  },
  2: {
    label: "2nd Place!",
    sub: "Right at the top — keep pushing!",
    Icon: Medal,
    gradient: "from-slate-300 via-slate-400 to-slate-500",
    iconColor: "text-slate-50",
    colors: ["#C0C0C0", "#E8E8E8", "#A0A0A0", "#FFFFFF"],
  },
  3: {
    label: "3rd Place!",
    sub: "Bronze and proud of it.",
    Icon: Award,
    gradient: "from-amber-500 via-orange-500 to-amber-700",
    iconColor: "text-amber-50",
    colors: ["#CD7F32", "#B8860B", "#D2691E", "#FFFFFF"],
  },
} as const;

const RankCelebration = ({ rank, onDismiss }: RankCelebrationProps) => {
  const [visible, setVisible] = useState(true);
  const cfg = rankConfig[rank];
  const Icon = cfg.Icon;

  useEffect(() => {
    // Confetti burst from both sides
    const fire = (originX: number) => {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 45,
        origin: { x: originX, y: 0.6 },
        colors: cfg.colors as unknown as string[],
      });
    };
    fire(0.2);
    setTimeout(() => fire(0.8), 200);
    setTimeout(() => fire(0.5), 450);

    // Auto dismiss after 5s
    const t = setTimeout(() => handleClose(), 5500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 pointer-events-none"
      role="dialog"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto relative max-w-sm w-full rounded-2xl shadow-2xl p-6 text-center animate-scale-in",
          "bg-gradient-to-br text-white",
          cfg.gradient
        )}
        style={{
          animation: "scale-in 0.4s ease-out, balloon-float 3s ease-in-out infinite 0.4s",
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Balloon string */}
        <div className="absolute left-1/2 -bottom-12 w-px h-12 bg-white/40 -translate-x-1/2" />

        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
            <Icon className={cn("w-9 h-9", cfg.iconColor)} />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-display mb-1">{cfg.label}</h2>
        <p className="text-sm text-white/90">{cfg.sub}</p>
      </div>

      <style>{`
        @keyframes balloon-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default RankCelebration;
