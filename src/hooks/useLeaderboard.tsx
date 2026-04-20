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

      // Fetch approved profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, approved")
        .eq("approved", true);

      // Fetch ALL approved submissions since the last reset
      // (matches what the StatsCards "Service Hours" totals show — the reset
      // button is what clears the slate, not the school-year date boundary)
      const { data: subs } = await supabase
        .from("submissions")
        .select("user_id, hours, service_type, status")
        .eq("status", "approved");

      if (cancelled) return;

      const profileMap = new Map<string, { full_name: string | null; email: string | null }>();
      (profiles || []).forEach((p) => {
        profileMap.set(p.id, { full_name: p.full_name, email: p.email });
      });

      // Aggregate per user (only approved members)
      const totals = new Map<
        string,
        { total: number; sync: number; async: number }
      >();
      (subs || []).forEach((s) => {
        if (!profileMap.has(s.user_id)) return; // exclude non-approved
        const cur = totals.get(s.user_id) || { total: 0, sync: 0, async: 0 };
        const h = Number(s.hours) || 0;
        cur.total += h;
        if (s.service_type === "synchronous") cur.sync += h;
        else cur.async += h;
        totals.set(s.user_id, cur);
      });

      // Include all approved members (even with 0 hours) so ranks reflect everyone
      profileMap.forEach((_, uid) => {
        if (!totals.has(uid)) totals.set(uid, { total: 0, sync: 0, async: 0 });
      });

      const list: LeaderboardEntry[] = Array.from(totals.entries()).map(
        ([user_id, t]) => ({
          user_id,
          full_name: profileMap.get(user_id)?.full_name ?? null,
          email: profileMap.get(user_id)?.email ?? null,
          total_hours: t.total,
          sync_hours: t.sync,
          async_hours: t.async,
          rank: 0,
        })
      );

      // Sort desc by total_hours; ties → same rank (standard competition ranking)
      list.sort((a, b) => b.total_hours - a.total_hours);
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
