import { useState } from "react";
import { Clock, Heart, Users, Inbox, ArrowRight, Newspaper, BarChart3, ShieldOff, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentSchoolYear, formatSchoolYearLabel } from "@/lib/schoolYear";

type TabType = "submit" | "pending" | "all" | "users" | "newsletters" | "statistics" | "inbox";

interface QuickActionsProps {
  isAdmin: boolean;
  setActiveTab: (tab: TabType) => void;
  onSubmitHours: () => void;
  acceptingResponses?: boolean;
  onToggleAcceptingResponses?: () => void;
  onSyncToExternal?: () => void;
  syncing?: boolean;
  onResetAllHours?: () => void;
  resettingHours?: boolean;
}

const QuickActions = ({ isAdmin, setActiveTab, onSubmitHours, acceptingResponses = true, onToggleAcceptingResponses, onSyncToExternal, syncing, onResetAllHours, resettingHours }: QuickActionsProps) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const userActions = [
    { label: "Submit Hours", icon: Clock, color: "text-blue-600", action: onSubmitHours },
  ];

  const adminActions = [
    {
      label: acceptingResponses ? "Stop Accepting Responses" : "Start Accepting Responses",
      icon: acceptingResponses ? ShieldOff : ShieldCheck,
      color: acceptingResponses ? "text-red-600" : "text-green-600",
      action: onToggleAcceptingResponses || (() => {}),
    },
    {
      label: syncing ? "Syncing..." : "Sync to External DB",
      icon: RefreshCw,
      color: "text-cyan-600",
      action: onSyncToExternal || (() => {}),
    },
    {
      label: "Reset This School Year's Hours",
      icon: Trash2,
      color: "text-red-600",
      action: () => setShowResetConfirm(true),
    },
  ];

  return (
    <>
      <div className={`grid ${isAdmin ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
        {/* Quick Actions */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Common tasks you might want to complete</p>
          
          <div className="space-y-2">
            {userActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${action.color}`} />
                    <span className={`font-medium ${action.color}`}>{action.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Admin Actions</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Administrative functions available to you</p>
            
            <div className="space-y-2">
              {adminActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${action.color}`} />
                      <span className={`font-medium ${action.color}`}>{action.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={(open) => { setShowResetConfirm(open); if (!open) setConfirmText(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Reset This School Year's Hours</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>all submissions from the {formatSchoolYearLabel(getCurrentSchoolYear())} school year (Aug 1 – Jul 31)</strong> for every user. Submissions from previous school years will be preserved. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">Type <strong>RESET</strong> to confirm:</p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type RESET"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowResetConfirm(false); setConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "RESET" || resettingHours}
              onClick={async () => {
                if (onResetAllHours) {
                  onResetAllHours();
                }
                setShowResetConfirm(false);
                setConfirmText("");
              }}
            >
              {resettingHours ? "Resetting..." : "Reset This Year"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;
