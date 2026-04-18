import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Inbox, 
  Newspaper, 
  BarChart3,
  FileText,
  Mail,
  Video,
  Settings,
  Calendar
} from "lucide-react";

type TabType = "submit" | "pending" | "all" | "users" | "newsletters" | "statistics" | "inbox" | "meetings" | "previous-years";

interface DashboardSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin: boolean;
  pendingCount?: number;
  unreadMessageCount?: number;
  onOpenSettings?: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

const DashboardSidebar = ({ activeTab, setActiveTab, isAdmin, pendingCount = 0, unreadMessageCount = 0, onOpenSettings }: DashboardSidebarProps) => {
  const userNavItems: NavItem[] = [
    { id: "submit", label: "Overview", icon: LayoutDashboard },
    { id: "previous-years", label: "Previous Years", icon: Calendar },
    { id: "meetings", label: "Meetings", icon: Video },
    { id: "inbox", label: "Inbox", icon: Mail },
  ];

  const adminNavItems: NavItem[] = [
    { id: "submit", label: "Overview", icon: LayoutDashboard },
    { id: "previous-years", label: "Previous Years", icon: Calendar },
    { id: "meetings", label: "Meetings", icon: Video },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "pending", label: "Hours Inbox", icon: Inbox, badge: pendingCount },
    { id: "inbox", label: "Inbox", icon: Mail, badge: unreadMessageCount },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "newsletters", label: "Newsletters", icon: Newspaper },
    { id: "all", label: "All Submissions", icon: FileText },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-card p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="text-xl font-bold text-primary font-display">Dashboard</h2>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && !item.badge && (
                <span className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onOpenSettings}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 border-t border-border pt-4"
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>
    </aside>
  );
};

export default DashboardSidebar;
