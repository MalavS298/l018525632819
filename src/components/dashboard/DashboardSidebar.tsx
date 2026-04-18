import { useState } from "react";
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
  Calendar,
  ChevronDown,
} from "lucide-react";

type TabType =
  | "submit"
  | "pending"
  | "all"
  | "users"
  | "newsletters"
  | "statistics"
  | "inbox"
  | "meetings"
  | "previous-years";

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

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const DashboardSidebar = ({
  activeTab,
  setActiveTab,
  isAdmin,
  pendingCount = 0,
  unreadMessageCount = 0,
  onOpenSettings,
}: DashboardSidebarProps) => {
  const sections: NavSection[] = [
    {
      id: "service",
      label: "Service",
      items: [
        { id: "submit", label: "Overview", icon: LayoutDashboard },
        { id: "previous-years", label: "Previous Years", icon: Calendar },
        { id: "meetings", label: "Meetings", icon: Video },
      ],
    },
    {
      id: "communication",
      label: "Communication",
      items: [
        { id: "inbox", label: "Inbox", icon: Mail, badge: unreadMessageCount },
        ...(isAdmin
          ? [{ id: "newsletters" as TabType, label: "Newsletters", icon: Newspaper }]
          : []),
      ],
    },
    ...(isAdmin
      ? [
          {
            id: "admin",
            label: "Admin",
            items: [
              { id: "users" as TabType, label: "Manage Users", icon: Users },
              { id: "pending" as TabType, label: "Hours Approval", icon: Inbox, badge: pendingCount },
              { id: "statistics" as TabType, label: "Statistics", icon: BarChart3 },
              { id: "all" as TabType, label: "All Submissions", icon: FileText },
            ],
          },
        ]
      : []),
  ];

  // Track open/closed state of each section. Default: open if it contains the active tab.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((s) => {
      initial[s.id] = true;
    });
    return initial;
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-card p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="text-xl font-bold text-primary font-display">Dashboard</h2>
      </div>

      <nav className="space-y-4 flex-1">
        {sections.map((section) => {
          const isOpen = openSections[section.id];
          const sectionHasActive = section.items.some((i) => i.id === activeTab);
          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{section.label}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    !isOpen && "-rotate-90"
                  )}
                />
              </button>

              {(isOpen || sectionHasActive) && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.badge && item.badge > 0 ? (
                          <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <span className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
