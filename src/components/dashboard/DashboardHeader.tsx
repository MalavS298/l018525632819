import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Award, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import RankBadge from "./RankBadge";
import Leaderboard from "./Leaderboard";
import RankCelebration from "./RankCelebration";

interface DashboardHeaderProps {
  userName: string | null | undefined;
  isAdmin: boolean;
  onSignOut: () => void;
}

const DashboardHeader = ({ userName, isAdmin, onSignOut }: DashboardHeaderProps) => {
  const displayName = userName || "Member";
  const firstName = displayName.split(" ")[0];

  const { user } = useAuth();
  const { entries, loading, myRank, schoolYearLabel } = useLeaderboard(user?.id);
  const [open, setOpen] = useState(false);
  const [celebrationRank, setCelebrationRank] = useState<1 | 2 | 3 | null>(null);

  // Trigger celebration once per session if user is top 3
  useEffect(() => {
    if (!user?.id || loading || !myRank) return;
    if (myRank > 3) return;

    const sessionKey = `rank_celebrated_${user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    sessionStorage.setItem(sessionKey, "1");
    setCelebrationRank(myRank as 1 | 2 | 3);
  }, [user?.id, myRank, loading]);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 md:p-8">
        {/* Background decoration */}
        <div className="absolute right-4 top-4 opacity-20">
          <Award className="w-24 h-24 md:w-32 md:h-32 text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white font-display">
              Welcome back, {firstName}!
            </h1>
            <RankBadge rank={myRank} onClick={() => setOpen(true)} />
          </div>

          <p className="text-white/80 text-sm md:text-base mb-3">
            NJHS Member Dashboard
          </p>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Sign out button */}
        <Button
          variant="ghost"
          onClick={onSignOut}
          className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </div>

      <Leaderboard
        open={open}
        onOpenChange={setOpen}
        entries={entries}
        loading={loading}
        currentUserId={user?.id}
        schoolYearLabel={schoolYearLabel}
      />

      {celebrationRank && (
        <RankCelebration
          rank={celebrationRank}
          onDismiss={() => setCelebrationRank(null)}
        />
      )}
    </>
  );
};

export default DashboardHeader;
