import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CountUp from "@/components/CountUp";

interface StatItem {
  label: string;
  end: number;
  suffix: string;
  key: "members" | "hours" | "static";
}

const baseStats: StatItem[] = [
  { label: "Active Members", end: 100, suffix: "+", key: "members" },
  { label: "Community Service Hours", end: 1800, suffix: "+", key: "hours" },
  { label: "Service Projects", end: 25, suffix: "+", key: "static" },
  { label: "Years Established", end: 2, suffix: "+", key: "static" },
  { label: "Alumni Network", end: 20, suffix: "+", key: "static" },
];

// round down to nearest 10
const floorTen = (n: number) => Math.max(Math.floor(n / 10) * 10, 0);

const About = () => {
  const [members, setMembers] = useState<number | null>(null);
  const [hours, setHours] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.rpc("get_public_stats");
      if (!active || error || !data) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setMembers(floorTen(Number(row.active_members) || 0));
        setHours(floorTen(Number(row.total_hours) || 0));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = baseStats.map((s) => {
    if (s.key === "members" && members !== null) return { ...s, end: members };
    if (s.key === "hours" && hours !== null) return { ...s, end: hours };
    return s;
  });

  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Our Mission
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground text-lg leading-relaxed">
            <p>
              The BASIS Cedar Park National Honor Society recognizes and celebrates exceptional high school students who demonstrate outstanding academic achievement and exemplary character.
            </p>
            <p>
              Our chapter is dedicated to fostering the development of well-rounded individuals who will become tomorrow's leaders. We provide opportunities for meaningful service, leadership growth, and character development that extends far beyond the classroom.
            </p>
            <p>
              Through community service projects, leadership initiatives, and academic support, our members make lasting positive impacts on our school and local community while preparing for future success.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-center text-xl font-semibold text-foreground mb-10">
            By the Numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-6 text-center transition-colors bg-secondary-foreground"
              >
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                  <CountUp end={stat.end} suffix={stat.suffix} duration={1800} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
