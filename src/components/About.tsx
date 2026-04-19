import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const baseStats = [
  { label: "Active Members", value: "100+", key: "members" as const },
  { label: "Community Service Hours", value: "1800+", key: "hours" as const },
  { label: "Service Projects", value: "25+", key: "static" as const },
  { label: "Years Established", value: "2+", key: "static" as const },
  { label: "Alumni Network", value: "20+", key: "static" as const },
];

const formatStat = (n: number) => {
  // round down to nearest 10 then add "+"
  const floored = Math.floor(n / 10) * 10;
  return `${Math.max(floored, 0)}+`;
};

const About = () => {
  const [members, setMembers] = useState<string | null>(null);
  const [hours, setHours] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.rpc("get_public_stats");
      if (!active || error || !data) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setMembers(formatStat(Number(row.active_members) || 0));
        setHours(formatStat(Number(row.total_hours) || 0));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = baseStats.map((s) => {
    if (s.key === "members" && members) return { ...s, value: members };
    if (s.key === "hours" && hours) return { ...s, value: hours };
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
              <div key={stat.label} className="rounded-2xl p-6 text-center transition-colors bg-secondary-foreground">
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
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
