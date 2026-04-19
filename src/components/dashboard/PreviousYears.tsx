import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { getSchoolYearForDate, getCurrentSchoolYear, formatSchoolYearLabel } from "@/lib/schoolYear";

interface Submission {
  id: string;
  hours: number;
  service_date: string;
  service_type: string;
  status: string;
  description?: string | null;
}

interface PreviousYearsProps {
  submissions: Submission[];
}

interface YearStats {
  year: number;
  totalHours: number;
  syncHours: number;
  asyncHours: number;
  submissionCount: number;
  submissions: Submission[];
}

const PreviousYears = ({ submissions }: PreviousYearsProps) => {
  const currentSchoolYear = getCurrentSchoolYear();

  const approved = submissions.filter((s) => s.status === "approved");

  const byYear = new Map<number, YearStats>();
  for (const s of approved) {
    const year = getSchoolYearForDate(s.service_date);
    if (year >= currentSchoolYear) continue;
    if (!byYear.has(year)) {
      byYear.set(year, {
        year,
        totalHours: 0,
        syncHours: 0,
        asyncHours: 0,
        submissionCount: 0,
        submissions: [],
      });
    }
    const stats = byYear.get(year)!;
    const hours = Number(s.hours);
    stats.totalHours += hours;
    if (s.service_type === "synchronous") stats.syncHours += hours;
    if (s.service_type === "asynchronous") stats.asyncHours += hours;
    stats.submissionCount += 1;
    stats.submissions.push(s);
  }

  const years = Array.from(byYear.values()).sort((a, b) => b.year - a.year);

  if (years.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 border border-border text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Previous School Years Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Once you have approved service hours from previous school years,
          you'll see a snapshot of your work here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Previous School Years</h2>
        <p className="text-sm text-muted-foreground">
          A snapshot of your service from past school years (Aug – Jul)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {years.map((y) => {
          const metRequirement = y.totalHours >= 25 && y.syncHours >= 18.75;
          return (
            <div
              key={y.year}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-2xl font-bold text-primary font-display">
                      {formatSchoolYearLabel(y.year)}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      metRequirement
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {metRequirement ? "Requirement met" : "Below minimum"}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Total Hours
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {y.totalHours.toFixed(1)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs text-muted-foreground">Sync</span>
                    </div>
                    <p className="text-lg font-semibold text-purple-600">
                      {y.syncHours.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs text-muted-foreground">Async</span>
                    </div>
                    <p className="text-lg font-semibold text-emerald-600">
                      {y.asyncHours.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {y.submissionCount}
                    </span>{" "}
                    {y.submissionCount === 1 ? "submission" : "submissions"} approved
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
