import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentSchoolYear } from "@/lib/schoolYear";

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  email: string | null;
  total_hours: number;
  sync_hours: number;
  async_hours: number;
  rank: number;
}

interface UseLeaderboardResult {
  entries: LeaderboardEntry[];
  loading: boolean;
  myRank: number | null;
  myEntry: LeaderboardEntry | null;
  schoolYearLabel: string;
  refresh: () => void;
}

export function useLeaderboard(currentUserId: string | undefined): UseLeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const schoolYear = getCurrentSchoolYear();
  const schoolYearLabel = `${schoolYear - 1}-${String(schoolYear).slice(-2)}`;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc("get_leaderboard");

      if (cancelled) return;

      if (error) {
        console.error("Error loading leaderboard:", error);
        setEntries([]);
        setLoading(false);
        return;
      }

      const list: LeaderboardEntry[] = (data || []).map((entry) => ({
        user_id: entry.user_id,
        full_name: entry.full_name,
        email: entry.email,
        total_hours: Number(entry.total_hours) || 0,
        sync_hours: Number(entry.sync_hours) || 0,
        async_hours: Number(entry.async_hours) || 0,
        rank: 0,
      }));

      // Sort desc by total hours; ties use a stable name/email fallback.
      list.sort(
        (a, b) =>
          b.total_hours - a.total_hours ||
          (a.full_name || a.email || "").localeCompare(b.full_name || b.email || "")
      );

      // Ties share the same rank (standard competition ranking).
      let lastHours = -1;
      let lastRank = 0;
      list.forEach((entry, idx) => {
        if (entry.total_hours !== lastHours) {
          lastRank = idx + 1;
          lastHours = entry.total_hours;
        }
        entry.rank = lastRank;
      });

      setEntries(list);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const myEntry = currentUserId
    ? entries.find((e) => e.user_id === currentUserId) ?? null
    : null;

  return {
    entries,
    loading,
    myRank: myEntry?.rank ?? null,
    myEntry,
    schoolYearLabel,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
