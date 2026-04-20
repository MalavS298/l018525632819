import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trophy, Medal, Award } from "lucide-react";
import { LeaderboardEntry } from "@/hooks/useLeaderboard";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: LeaderboardEntry[];
  loading: boolean;
  currentUserId: string | undefined;
  schoolYearLabel: string;
}

const rankStyles = (rank: number) => {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-700";
  return "text-muted-foreground";
};

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className={cn("w-5 h-5", rankStyles(rank))} />;
  if (rank === 2) return <Medal className={cn("w-5 h-5", rankStyles(rank))} />;
  if (rank === 3) return <Award className={cn("w-5 h-5", rankStyles(rank))} />;
  return <span className="w-5 h-5 inline-flex items-center justify-center text-sm font-semibold text-muted-foreground">{rank}</span>;
};

const Leaderboard = ({ open, onOpenChange, entries, loading, currentUserId, schoolYearLabel }: LeaderboardProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Service Hours Leaderboard
          </DialogTitle>
          <DialogDescription>
            Ranked by approved service hours since the last reset
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto -mx-6 px-6 mt-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading leaderboard...</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No members yet</p>
          ) : (
            <ol className="space-y-1.5">
              {entries.map((entry) => {
                const isMe = entry.user_id === currentUserId;
                const isTop3 = entry.rank <= 3;
                return (
                  <li
                    key={entry.user_id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
                      isMe
                        ? "bg-primary/10 border-primary/40"
                        : isTop3
                          ? "bg-muted/40 border-border"
                          : "bg-background border-border/50"
                    )}
                  >
                    <div className="w-8 flex justify-center">
                      <RankIcon rank={entry.rank} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium truncate", isMe && "text-primary")}>
                        {entry.full_name || entry.email || "Member"}
                        {isMe && <span className="ml-2 text-xs text-primary/80">(you)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.sync_hours.toFixed(1)}h sync · {entry.async_hours.toFixed(1)}h async
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums">{entry.total_hours.toFixed(1)}h</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard;
