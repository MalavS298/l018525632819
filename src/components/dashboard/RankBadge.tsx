import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: number | null;
  onClick?: () => void;
  className?: string;
}

const rankInfo = (rank: number) => {
  if (rank === 1)
    return {
      Icon: Trophy,
      label: "1st",
      ring: "ring-yellow-300/60",
      bg: "bg-yellow-400/20 hover:bg-yellow-400/30",
      text: "text-yellow-200",
    };
  if (rank === 2)
    return {
      Icon: Medal,
      label: "2nd",
      ring: "ring-slate-200/60",
      bg: "bg-slate-300/20 hover:bg-slate-300/30",
      text: "text-slate-100",
    };
  if (rank === 3)
    return {
      Icon: Award,
      label: "3rd",
      ring: "ring-amber-300/60",
      bg: "bg-amber-500/20 hover:bg-amber-500/30",
      text: "text-amber-100",
    };
  return null;
};

const RankBadge = ({ rank, onClick, className }: RankBadgeProps) => {
  if (!rank) {
    // Still render a clickable trophy so users can open the leaderboard
    return (
      <button
        type="button"
        onClick={onClick}
        title="View leaderboard"
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors backdrop-blur-sm",
          "bg-white/15 hover:bg-white/25 text-white/90 ring-1 ring-white/20",
          className
        )}
      >
        <Trophy className="w-3.5 h-3.5" />
        Leaderboard
      </button>
    );
  }

  const info = rankInfo(rank);
  if (!info) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={`Your rank: #${rank} — view leaderboard`}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors backdrop-blur-sm",
          "bg-white/15 hover:bg-white/25 text-white/90 ring-1 ring-white/20",
          className
        )}
      >
        <Trophy className="w-3.5 h-3.5" />
        #{rank}
      </button>
    );
  }

  const { Icon, label, ring, bg, text } = info;
  return (
    <button
      type="button"
      onClick={onClick}
      title={`You're ranked ${label} — view leaderboard`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all backdrop-blur-sm ring-1 animate-scale-in",
        bg,
        text,
        ring,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
};

export default RankBadge;
