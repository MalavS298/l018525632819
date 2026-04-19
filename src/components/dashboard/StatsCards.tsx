import { TrendingUp, Users, Award, Clock } from "lucide-react";
import CountUp from "@/components/CountUp";

interface StatsCardsProps {
  syncHours: number;
  asyncHours: number;
  totalHours: number;
  submissionsCount: number;
  pendingCount?: number;
  isAdmin: boolean;
}

const StatsCards = ({ 
  syncHours, 
  asyncHours, 
  totalHours,
  submissionsCount,
  pendingCount = 0,
  isAdmin 
}: StatsCardsProps) => {
  const belowServiceThreshold = totalHours < 25;
  const belowSyncThreshold = syncHours < 18.75;

  const stats = [
    {
      label: "Service Hours",
      end: totalHours,
      decimals: 1,
      subtitle: "hours completed this year",
      icon: TrendingUp,
      valueColor: "text-blue-600",
      warning: belowServiceThreshold,
    },
    {
      label: "Sync Hours",
      end: syncHours,
      decimals: 1,
      subtitle: "synchronous service",
      icon: Users,
      valueColor: "text-purple-600",
      warning: belowSyncThreshold,
    },
    {
      label: "Async Hours",
      end: asyncHours,
      decimals: 1,
      subtitle: "asynchronous service",
      icon: Clock,
      valueColor: "text-emerald-600",
      warning: belowServiceThreshold,
    },
  ];

  if (isAdmin && pendingCount > 0) {
    stats.push({
      label: "Pending",
      end: pendingCount,
      decimals: 0,
      subtitle: "awaiting approval",
      icon: Award,
      valueColor: "text-amber-600",
      warning: false,
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label}
            className={`bg-card rounded-xl p-5 border-2 ${stat.warning ? 'border-destructive' : 'border-border'} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <Icon className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className={`text-3xl font-bold ${stat.valueColor} mb-1`}>
              <CountUp end={stat.end} decimals={stat.decimals} duration={1400} />
            </p>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            {stat.warning && (
              <p className="text-xs font-medium text-destructive mt-2">Minimum hours not met</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
