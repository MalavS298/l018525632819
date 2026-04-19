// School year runs Aug 1 -> Jul 31.
// The "school year" is labeled by the spring/end year (e.g., Aug 2025 - Jul 2026 = "2026").

export const SCHOOL_YEAR_START_MONTH = 8; // August (1-indexed)

export function getSchoolYearForDate(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  return month >= SCHOOL_YEAR_START_MONTH ? year + 1 : year;
}

export function getCurrentSchoolYear(): number {
  return getSchoolYearForDate(new Date());
}

// Returns inclusive start (YYYY-MM-DD) and exclusive end (YYYY-MM-DD)
// for the given school-year label (the spring/end year).
export function getSchoolYearRange(schoolYear: number): { start: string; endExclusive: string } {
  const startYear = schoolYear - 1;
  return {
    start: `${startYear}-08-01`,
    endExclusive: `${schoolYear}-08-01`,
  };
}

export function formatSchoolYearLabel(schoolYear: number): string {
  return `${schoolYear - 1}-${String(schoolYear).slice(-2)}`;
}
