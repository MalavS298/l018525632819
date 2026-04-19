import { useEffect, useState } from "react";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PerUserStat {
  user_id: string;
  total_hours: number;
  sync_hours: number;
  async_hours: number;
  submissions: number;
}

interface YearReset {
  id: string;
  label: string;
  period_start: string;
  period_end: string;
  total_submissions: number;
  total_hours: number;
  sync_hours: number;
  async_hours: number;
  per_user_stats: PerUserStat[];
}

interface PreviousYearsProps {
  isAdmin?: boolean;
}

const PreviousYears = ({ isAdmin = false }: PreviousYearsProps) => {
  const { user } = useAuth();
  const [resets, setResets] = useState<YearReset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("year_resets")
        .select("*")
        .order("period_end", { ascending: false });
      if (!error && data) {
        setResets(data as any as YearReset[]);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-12 border border-border text-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (resets.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 border border-border text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Previous School Years Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Once an admin ends the current school year, a snapshot of everyone's
          approved hours will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Previous School Years</h2>
        <p className="text-sm text-muted-foreground">
          Snapshots saved each time an admin closes out a school year
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resets.map((y) => {
          // For non-admins, show only their own stats; admins see chapter totals
          const myStats = !isAdmin && user
            ? y.per_user_stats.find((p) => p.user_id === user.id)
            : null;

          const totalHours = myStats ? myStats.total_hours : Number(y.total_hours);
          const syncHours = myStats ? myStats.sync_hours : Number(y.sync_hours);
          const asyncHours = myStats ? myStats.async_hours : Number(y.async_hours);
          const subCount = myStats ? myStats.submissions : y.total_submissions;

          if (!isAdmin && !myStats) {
            // User had nothing in that year — still show the year as 0
          }

          const metRequirement = totalHours >= 25 && syncHours >= 18.75;

          return (
            <div
              key={y.id}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 p-5 border-b border-border">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="text-xl font-bold text-primary font-display truncate">
                      {y.label}
                    </h3>
                  </div>
                  {!isAdmin && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                        metRequirement
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {metRequirement ? "Requirement met" : "Below minimum"}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {isAdmin ? "Chapter Total Hours" : "Total Hours"}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalHours.toFixed(1)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs text-muted-foreground">Sync</span>
                    </div>
                    <p className="text-lg font-semibold text-purple-600">
                      {syncHours.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs text-muted-foreground">Async</span>
                    </div>
                    <p className="text-lg font-semibold text-emerald-600">
                      {asyncHours.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{subCount}</span>{" "}
                    {subCount === 1 ? "submission" : "submissions"} approved
                    {isAdmin && (
                      <> · {y.per_user_stats.length} {y.per_user_stats.length === 1 ? "member" : "members"}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviousYears;
