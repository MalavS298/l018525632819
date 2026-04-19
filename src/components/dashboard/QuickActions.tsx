import { useState } from "react";
import { Clock, Users, ArrowRight, ShieldOff, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TabType = "submit" | "pending" | "all" | "users" | "newsletters" | "statistics" | "inbox";

interface QuickActionsProps {
  isAdmin: boolean;
  setActiveTab: (tab: TabType) => void;
  onSubmitHours: () => void;
  acceptingResponses?: boolean;
  onToggleAcceptingResponses?: () => void;
  onSyncToExternal?: () => void;
  syncing?: boolean;
  onResetAllHours?: (label: string) => void;
  resettingHours?: boolean;
}

const QuickActions = ({ isAdmin, onSubmitHours, acceptingResponses = true, onToggleAcceptingResponses, onSyncToExternal, syncing, onResetAllHours, resettingHours }: QuickActionsProps) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [yearLabel, setYearLabel] = useState("");

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
      label: "End School Year & Reset",
      icon: Trash2,
      color: "text-red-600",
      action: () => setShowResetConfirm(true),
    },
  ];

  return (
    <>
      <div className={`grid ${isAdmin ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
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

      <Dialog open={showResetConfirm} onOpenChange={(open) => { setShowResetConfirm(open); if (!open) { setConfirmText(""); setYearLabel(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">End School Year & Reset</DialogTitle>
            <DialogDescription>
              This will save a snapshot of the <strong>current school year</strong> to Previous Years and then permanently delete the underlying submissions for every user. After this, a new school year begins. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="year-label">Label this school year</Label>
              <Input
                id="year-label"
                value={yearLabel}
                onChange={(e) => setYearLabel(e.target.value)}
                placeholder="e.g. 2025-2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Type <strong>RESET</strong> to confirm</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type RESET"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowResetConfirm(false); setConfirmText(""); setYearLabel(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "RESET" || !yearLabel.trim() || resettingHours}
              onClick={() => {
                if (onResetAllHours) onResetAllHours(yearLabel.trim());
                setShowResetConfirm(false);
                setConfirmText("");
                setYearLabel("");
              }}
            >
              {resettingHours ? "Resetting..." : "End Year & Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;
