import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Upload, X, Clock, CheckCircle, XCircle, ZoomIn, CalendarIcon, Plus, Trash2, ChevronDown, ChevronUp, Home, Send, Video, ExternalLink, FileText, Users, Check, ChevronsUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import QuickActions from "@/components/dashboard/QuickActions";

type TabType = "submit" | "pending" | "all" | "users" | "newsletters" | "statistics" | "inbox" | "meetings";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  duration_minutes: number;
  zoom_meeting_id: string | null;
  join_url: string | null;
  created_by: string;
  created_at: string;
}

interface MeetingDetails {
  id?: string;
  meeting_id: string;
  notes: string | null;
  attendee_ids: string[];
}

interface Submission {
  id: string;
  user_id: string;
  image_url: string | null;
  description: string | null;
  hours: number;
  submitted_at: string;
  service_date: string;
  service_type: string;
  status: string;
  user_name?: string | null;
  user_email?: string | null;
}

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

// Add Hours Form Component
const AddHoursForm = ({ users, onSuccess }: { users: UserProfile[], onSuccess: () => void }) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [hours, setHours] = useState("");
  const [serviceType, setServiceType] = useState<"synchronous" | "asynchronous">("synchronous");
  const [primaryApprover, setPrimaryApprover] = useState("");
  const [description, setDescription] = useState("");
  const [serviceDate, setServiceDate] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("submissions").insert({
        user_id: selectedUserId,
        description,
        hours: parseFloat(hours) || 0,
        service_date: format(serviceDate, "yyyy-MM-dd"),
        service_type: serviceType,
        primary_approver: primaryApprover || null,
        status: "approved",
        approved_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Hours added successfully!");
      setSelectedUserId("");
      setHours("");
      setDescription("");
      setServiceDate(new Date());
      setServiceType("synchronous");
      setPrimaryApprover("");
      onSuccess();
    } catch (error) {
      console.error("Error adding hours:", error);
      toast.error("Failed to add hours");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Manually Add Hours</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Select User</Label>
          <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={userSearchOpen} className="w-full justify-between">
                {selectedUserId
                  ? (users.find((u) => u.id === selectedUserId)?.full_name || users.find((u) => u.id === selectedUserId)?.email || "Unknown")
                  : "Choose a user"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search members..." />
                <CommandList>
                  <CommandEmpty>No member found.</CommandEmpty>
                  <CommandGroup>
                    {users.map((u) => (
                      <CommandItem
                        key={u.id}
                        value={u.full_name || u.email || u.id}
                        onSelect={() => {
                          setSelectedUserId(u.id);
                          setUserSearchOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedUserId === u.id ? "opacity-100" : "opacity-0")} />
                        {u.full_name || u.email || "Unknown"}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Hours</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Service Type</Label>
          <Select value={serviceType} onValueChange={(value: "synchronous" | "asynchronous") => setServiceType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="synchronous">Synchronous</SelectItem>
              <SelectItem value="asynchronous">Asynchronous</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date of Service</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !serviceDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {serviceDate ? format(serviceDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={serviceDate}
                onSelect={(date) => date && setServiceDate(date)}
                disabled={(date) => date > new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Primary Approver</Label>
          <Input
            placeholder="Enter primary approver name"
            value={primaryApprover}
            onChange={(e) => setPrimaryApprover(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Description (Optional)</Label>
          <Textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Adding..." : "Add Hours"}
        </Button>
      </form>
    </>
  );
};

// User Statistics List Component with expandable submissions
const UserStatisticsList = ({ 
  users, 
  allSubmissions, 
  onDeleteSubmission,
  searchQuery
}: { 
  users: UserProfile[], 
  allSubmissions: Submission[], 
  onDeleteSubmission: (id: string) => void,
  searchQuery: string
}) => {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  if (users.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No users found</p>;
  }

  const getLastName = (fullName: string | null) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(" ");
    return parts[parts.length - 1];
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => 
    getLastName(a.full_name).localeCompare(getLastName(b.full_name))
  );

  if (sortedUsers.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No members match your search</p>;
  }

  return (
    <div className="space-y-3">
      {sortedUsers.map((userProfile) => {
        const userSubmissions = allSubmissions.filter(
          s => s.user_id === userProfile.id && s.status === "approved"
        );
        const userTotalHours = userSubmissions.reduce((sum, s) => sum + Number(s.hours), 0);
        const syncHours = userSubmissions
          .filter(s => s.service_type === "synchronous")
          .reduce((sum, s) => sum + Number(s.hours), 0);
        const asyncHours = userSubmissions
          .filter(s => s.service_type === "asynchronous")
          .reduce((sum, s) => sum + Number(s.hours), 0);
        const isExpanded = expandedUserId === userProfile.id;

        const belowRequirements = userTotalHours < 25 || syncHours < 18;

        return (
          <div key={userProfile.id} className={`bg-muted/50 rounded-lg border-2 overflow-hidden ${belowRequirements ? 'border-destructive' : 'border-border'}`}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => setExpandedUserId(isExpanded ? null : userProfile.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                <div>
                  <p className="font-medium text-foreground">
                    {userProfile.full_name || "No name"}
                  </p>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Synchronous</p>
                  <p className="text-lg font-semibold text-purple-600">{syncHours.toFixed(1)}h</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Asynchronous</p>
                  <p className="text-lg font-semibold text-blue-600">{asyncHours.toFixed(1)}h</p>
                </div>
                <div className="text-center border-l border-border pl-6">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">{userTotalHours.toFixed(1)}h</p>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border p-4 bg-background/50">
                {userSubmissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No approved submissions</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Approved Submissions:</p>
                    {userSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{Number(submission.hours).toFixed(1)}h</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              submission.service_type === "synchronous"
                                ? "bg-purple-500/10 text-purple-600"
                                : "bg-blue-500/10 text-blue-600"
                            }`}>
                              {submission.service_type}
                            </span>
                          </div>
                          {submission.description && (
                            <p className="text-sm text-muted-foreground mt-1">{submission.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Service date: {new Date(submission.service_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSubmission(submission.id);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [syncHours, setSyncHours] = useState(0);
  const [asyncHours, setAsyncHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("submit");
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Newsletter state
  const [newsletters, setNewsletters] = useState<{id: string; title: string; content: string; published_at: string}[]>([]);
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterContent, setNewsletterContent] = useState("");
  const [publishingNewsletter, setPublishingNewsletter] = useState(false);

  // Form state
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [serviceDate, setServiceDate] = useState<Date>(new Date());
  const [serviceType, setServiceType] = useState<"synchronous" | "asynchronous">("synchronous");
  const [primaryApprover, setPrimaryApprover] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Statistics search state
  const [statisticsSearch, setStatisticsSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [userSearch, setUserSearch] = useState("");


  const [messages, setMessages] = useState<{id: string; user_id: string; subject: string; description: string; created_at: string; read: boolean; user_name?: string; user_email?: string}[]>([]);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageDescription, setMessageDescription] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageReason, setMessageReason] = useState("");
  const [acceptingResponses, setAcceptingResponses] = useState(true);

  // Meetings state
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingStartTime, setMeetingStartTime] = useState("");
  const [meetingDuration, setMeetingDuration] = useState("60");
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  // Meeting details state
  const [meetingDetailsMap, setMeetingDetailsMap] = useState<Record<string, MeetingDetails>>({});
  const [detailsDialogMeetingId, setDetailsDialogMeetingId] = useState<string | null>(null);
  const [detailsNotes, setDetailsNotes] = useState("");
  const [detailsAttendees, setDetailsAttendees] = useState<string[]>([]);
  const [savingDetails, setSavingDetails] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState("");
  const [settingsNewPassword, setSettingsNewPassword] = useState("");
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch accepting_responses from database
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("accepting_responses")
        .eq("id", "global")
        .single();
      if (data) setAcceptingResponses(data.accepting_responses);
    };
    fetchSettings();
  }, []);

  // Get user's name from profiles
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
      fetchUserProfile();
      fetchMessages();
      fetchMeetings();
      fetchMeetingDetails();
      if (isAdmin) {
        fetchAllSubmissions();
        fetchUsers();
        fetchNewsletters();
      }
    }
  }, [user, isAdmin]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setUserName(data?.full_name || null);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user?.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      const approvedSubmissions = (data || []).filter(s => s.status === "approved");
      const total = approvedSubmissions.reduce((sum, sub) => sum + Number(sub.hours), 0);
      const syncTotal = approvedSubmissions
        .filter(s => s.service_type === "synchronous")
        .reduce((sum, sub) => sum + Number(sub.hours), 0);
      const asyncTotal = approvedSubmissions
        .filter(s => s.service_type === "asynchronous")
        .reduce((sum, sub) => sum + Number(sub.hours), 0);
      setTotalHours(total);
      setSyncHours(syncTotal);
      setAsyncHours(asyncTotal);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubmissions = async () => {
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (submissionsError) throw submissionsError;

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email");

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      const submissionsWithProfiles = (submissionsData || []).map(s => ({
        ...s,
        user_name: profilesMap.get(s.user_id)?.full_name,
        user_email: profilesMap.get(s.user_id)?.email,
      }));

      setAllSubmissions(submissionsWithProfiles);
    } catch (error) {
      console.error("Error fetching all submissions:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletters")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (isAdmin) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email");

        const profilesMap = new Map(
          (profilesData || []).map(p => [p.id, p])
        );

        setMessages((messagesData || []).map(m => ({
          ...m,
          user_name: profilesMap.get(m.user_id)?.full_name,
          user_email: profilesMap.get(m.user_id)?.email,
        })));
      } else {
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!messageReason) {
      toast.error("Please select a reason");
      return;
    }

    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        user_id: user.id,
        subject: `[${messageReason}] ${messageSubject}`,
        description: messageDescription,
      });

      if (error) throw error;

      toast.success("Message sent to admins!");
      setMessageSubject("");
      setMessageDescription("");
      setMessageReason("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMarkMessageRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      toast.success("Message deleted");
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("start_time", { ascending: true });
      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!meetingTitle || !meetingStartTime) {
      toast.error("Please fill in title and start time");
      return;
    }

    setCreatingMeeting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoom-meetings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            title: meetingTitle,
            description: meetingDescription,
            start_time: new Date(meetingStartTime).toISOString(),
            duration_minutes: parseInt(meetingDuration) || 60,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create meeting");

      toast.success("Meeting created successfully!");
      setMeetingTitle("");
      setMeetingDescription("");
      setMeetingStartTime("");
      setMeetingDuration("60");
      setShowMeetingForm(false);
      fetchMeetings();
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      toast.error(error.message || "Failed to create meeting");
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const { error } = await supabase.from("meetings").delete().eq("id", meetingId);
      if (error) throw error;
      toast.success("Meeting deleted");
      fetchMeetings();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  const fetchMeetingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_details" as any)
        .select("*");
      if (error) throw error;
      const map: Record<string, MeetingDetails> = {};
      for (const row of ((data as unknown as MeetingDetails[]) || [])) {
        map[row.meeting_id] = row;
      }
      setMeetingDetailsMap(map);
    } catch (error) {
      console.error("Error fetching meeting details:", error);
    }
  };

  const handleOpenSettings = () => {
    setSettingsName(userName || "");
    setSettingsNewPassword("");
    setSettingsConfirmPassword("");
    setSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const trimmedName = settingsName.trim();
      if (!trimmedName) {
        toast.error("Name cannot be empty");
        setSavingSettings(false);
        return;
      }

      // Update name in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: trimmedName })
        .eq("id", user!.id);
      if (profileError) throw profileError;

      // Update password if provided
      if (settingsNewPassword) {
        if (settingsNewPassword.length < 6) {
          toast.error("Password must be at least 6 characters");
          setSavingSettings(false);
          return;
        }
        if (settingsNewPassword !== settingsConfirmPassword) {
          toast.error("Passwords do not match");
          setSavingSettings(false);
          return;
        }
        const { error: pwError } = await supabase.auth.updateUser({ password: settingsNewPassword });
        if (pwError) throw pwError;
      }

      toast.success("Settings saved successfully");
      setSettingsOpen(false);
      fetchUserProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const openDetailsDialog = (meetingId: string) => {
    const existing = meetingDetailsMap[meetingId];
    setDetailsNotes(existing?.notes || "");
    setDetailsAttendees(existing?.attendee_ids || []);
    setAttendeeSearch("");
    setDetailsDialogMeetingId(meetingId);
  };

  const handleSaveMeetingDetails = async () => {
    if (!detailsDialogMeetingId) return;
    setSavingDetails(true);
    try {
      const existing = meetingDetailsMap[detailsDialogMeetingId];
      if (existing?.id) {
        const { error } = await supabase
          .from("meeting_details" as any)
          .update({ notes: detailsNotes, attendee_ids: detailsAttendees })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("meeting_details" as any)
          .insert({ meeting_id: detailsDialogMeetingId, notes: detailsNotes, attendee_ids: detailsAttendees });
        if (error) throw error;
      }
      toast.success("Meeting details saved!");
      setDetailsDialogMeetingId(null);
      fetchMeetingDetails();
    } catch (error) {
      console.error("Error saving meeting details:", error);
      toast.error("Failed to save meeting details");
    } finally {
      setSavingDetails(false);
    }
  };

  const toggleAttendee = (userId: string) => {
    setDetailsAttendees(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handlePublishNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setPublishingNewsletter(true);
    try {
      const { error } = await supabase.from("newsletters").insert({
        title: newsletterTitle,
        content: newsletterContent,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Newsletter published!");
      setNewsletterTitle("");
      setNewsletterContent("");
      fetchNewsletters();
    } catch (error) {
      console.error("Error publishing newsletter:", error);
      toast.error("Failed to publish newsletter");
    } finally {
      setPublishingNewsletter(false);
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    try {
      const { error } = await supabase
        .from("newsletters")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Newsletter deleted");
      fetchNewsletters();
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      toast.error("Failed to delete newsletter");
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submissionId);

      if (error) throw error;

      toast.success("Submission deleted");
      fetchAllSubmissions();
      fetchSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete submission");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("submissions")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("submissions")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("submissions").insert({
        user_id: user.id,
        description,
        hours: parseFloat(hours) || 0,
        image_url: imageUrl,
        service_date: format(serviceDate, "yyyy-MM-dd"),
        service_type: serviceType,
        primary_approver: primaryApprover || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Submission added! Awaiting admin approval.");
      
      setDescription("");
      setHours("");
      setServiceDate(new Date());
      setServiceType("synchronous");
      setPrimaryApprover("");
      setImage(null);
      setImagePreview(null);
      setShowSubmitForm(false);
      
      fetchSubmissions();
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (submissionId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: approved ? "approved" : "rejected",
          approved_at: approved ? new Date().toISOString() : null,
          approved_by: user?.id,
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast.success(approved ? "Submission approved!" : "Submission rejected");
      fetchAllSubmissions();
      fetchSubmissions();
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: { full_name: newUserName }
        }
      });

      if (error) throw error;

      toast.success("User added successfully!");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      
      setTimeout(() => fetchUsers(), 1000);
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to add user");
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This will also delete all their submissions.")) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      fetchUsers();
      fetchAllSubmissions();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const pendingSubmissions = allSubmissions.filter(s => s.status === "pending");
  const unreadMessages = messages.filter(m => !m.read);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin} 
        pendingCount={pendingSubmissions.length}
        unreadMessageCount={isAdmin ? unreadMessages.length : 0}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Home button */}
        <div className="mb-4">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </a>
        </div>

        {/* Header with gradient */}
        <DashboardHeader 
          userName={userName}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
        />

        {/* Stats Cards */}
        <div className="mt-6">
          <StatsCards 
            syncHours={syncHours}
            asyncHours={asyncHours}
            totalHours={totalHours}
            submissionsCount={submissions.length}
            pendingCount={pendingSubmissions.length}
            isAdmin={isAdmin}
          />
        </div>

        {/* Content based on tab */}
        <div className="mt-6">
          {activeTab === "submit" && (
            <div className="space-y-6">
              {/* Not accepting responses banner */}
              {!acceptingResponses && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-destructive font-semibold text-lg">NOT ACCEPTING RESPONSES</span>
                </div>
              )}
              {/* Quick Actions */}
              <QuickActions 
                isAdmin={isAdmin}
                setActiveTab={setActiveTab}
                onSubmitHours={() => {
                  if (!acceptingResponses) {
                    toast.error("NOT ACCEPTING RESPONSES");
                    return;
                  }
                  setShowSubmitForm(true);
                }}
                acceptingResponses={acceptingResponses}
                onToggleAcceptingResponses={async () => {
                  const newValue = !acceptingResponses;
                  const { error } = await supabase
                    .from("app_settings")
                    .update({ accepting_responses: newValue, updated_at: new Date().toISOString() })
                    .eq("id", "global");
                  if (error) {
                    toast.error("Failed to update setting");
                    return;
                  }
                  setAcceptingResponses(newValue);
                  toast(newValue ? "Now accepting responses" : "Stopped accepting responses");
                }}
                syncing={syncing}
                onSyncToExternal={async () => {
                  setSyncing(true);
                  try {
                    const { data, error } = await supabase.functions.invoke("sync-to-external");
                    if (error) throw error;
                    if (data?.success) {
                      const results = data.results;
                      const totalSynced = Object.values(results).reduce((sum: number, r: any) => sum + r.synced, 0);
                      const errors = Object.entries(results).filter(([_, r]: any) => r.error);
                      if (errors.length > 0) {
                        toast.warning(`Synced ${totalSynced} rows. ${errors.length} table(s) had errors.`);
                        console.log("Sync errors:", errors);
                      } else {
                        toast.success(`Successfully synced ${totalSynced} rows to external database!`);
                      }
                    } else {
                      toast.error(data?.error || "Sync failed");
                    }
                  } catch (error: any) {
                    console.error("Sync error:", error);
                    toast.error("Failed to sync: " + (error.message || "Unknown error"));
                  } finally {
                    setSyncing(false);
                  }
                }}
                onResetAllHours={async () => {
                  try {
                    const { error } = await supabase
                      .from("submissions")
                      .delete()
                      .neq("id", "00000000-0000-0000-0000-000000000000");
                    if (error) throw error;
                    toast.success("All hours have been reset successfully");
                    fetchSubmissions();
                    fetchAllSubmissions();
                  } catch (error: any) {
                    console.error("Reset error:", error);
                    toast.error("Failed to reset hours: " + (error.message || "Unknown error"));
                  }
                }}
              />

              {/* Submit Hours Dialog */}
              <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Submit Service Hours</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="hours">Hours</Label>
                      <Input
                        id="hours"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter hours"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Service Type</Label>
                      <Select value={serviceType} onValueChange={(value: "synchronous" | "asynchronous") => setServiceType(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="synchronous">Synchronous</SelectItem>
                          <SelectItem value="asynchronous">Asynchronous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date of Service</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !serviceDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {serviceDate ? format(serviceDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={serviceDate}
                            onSelect={(date) => date && setServiceDate(date)}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryApprover">Primary Approver</Label>
                      <Input
                        id="primaryApprover"
                        placeholder="Enter primary approver name"
                        value={primaryApprover}
                        onChange={(e) => setPrimaryApprover(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="What did you work on?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {serviceType === "asynchronous" && (
                      <div className="space-y-2">
                        <Label>Photo Evidence (Required)</Label>
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-40 object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                          >
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Click to upload (required)</span>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitting || (serviceType === "asynchronous" && !image)}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Recent Submissions */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">My Recent Submissions</h2>
                {submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No submissions yet</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {submissions.slice(0, 5).map((submission) => (
                      <div
                        key={submission.id}
                        className="flex gap-4 p-4 bg-muted/50 rounded-lg border border-border"
                      >
                        {submission.image_url && (
                          <img
                            src={submission.image_url}
                            alt="Submission"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">{submission.hours} hours</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              submission.status === "approved" 
                                ? "bg-emerald-500/10 text-emerald-600" 
                                : submission.status === "rejected"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {submission.status}
                            </span>
                          </div>
                          {submission.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {submission.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "pending" && isAdmin && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pending Submissions</h2>
              {pendingSubmissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending submissions</p>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex gap-4 p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      {submission.image_url && (
                        <div 
                          className="relative group cursor-pointer"
                          onClick={() => setEnlargedImage(submission.image_url)}
                        >
                          <img
                            src={submission.image_url}
                            alt="Submission"
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-foreground">{submission.hours} hours</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              by {submission.user_name || submission.user_email || "Unknown"}
                            </span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              submission.service_type === "asynchronous" 
                                ? "bg-blue-500/10 text-blue-600" 
                                : "bg-purple-500/10 text-purple-600"
                            }`}>
                              {submission.service_type || "synchronous"}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              Service: {new Date(submission.service_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {submission.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {submission.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproval(submission.id, true)}
                            className="gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(submission.id, false)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "all" && isAdmin && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">All Submissions</h2>
              {allSubmissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No submissions yet</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {allSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex gap-4 p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      {submission.image_url && (
                        <div 
                          className="relative group cursor-pointer"
                          onClick={() => setEnlargedImage(submission.image_url)}
                        >
                          <img
                            src={submission.image_url}
                            alt="Submission"
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-foreground">{submission.hours} hours</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              by {submission.user_name || submission.user_email || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              submission.status === "approved" 
                                ? "bg-emerald-500/10 text-emerald-600" 
                                : submission.status === "rejected"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {submission.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {submission.description && (
                          <p className="text-sm text-muted-foreground">
                            {submission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add User Form */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Add New User</h2>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newUserName">Full Name</Label>
                    <Input
                      id="newUserName"
                      type="text"
                      placeholder="John Doe"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newUserEmail">Email</Label>
                    <Input
                      id="newUserEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newUserPassword">Password</Label>
                    <Input
                      id="newUserPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addingUser}>
                    {addingUser ? "Adding..." : "Add User"}
                  </Button>
                </form>
              </div>

              {/* Users List */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">All Users</h2>
                <Input
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="mb-4"
                />
                {users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users yet</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {users.filter((u) => {
                      const q = userSearch.toLowerCase();
                      return !q || (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
                    }).map((userProfile) => (
                      <div
                        key={userProfile.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {userProfile.full_name || "No name"}
                          </p>
                          <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {new Date(userProfile.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(userProfile.id)}
                            disabled={deletingUserId === userProfile.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          >
                            {deletingUserId === userProfile.id ? (
                              <span className="animate-spin">⋯</span>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "newsletters" && isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Publish Newsletter Form */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Publish Newsletter</h2>
                <form onSubmit={handlePublishNewsletter} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsletterTitle">Title</Label>
                    <Input
                      id="newsletterTitle"
                      placeholder="Newsletter title"
                      value={newsletterTitle}
                      onChange={(e) => setNewsletterTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newsletterContent">Content</Label>
                    <Textarea
                      id="newsletterContent"
                      placeholder="Write your newsletter content here..."
                      value={newsletterContent}
                      onChange={(e) => setNewsletterContent(e.target.value)}
                      rows={8}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={publishingNewsletter}>
                    {publishingNewsletter ? "Publishing..." : "Publish Newsletter"}
                  </Button>
                </form>
              </div>

              {/* Past Newsletters */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Published Newsletters</h2>
                {newsletters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No newsletters published yet</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {newsletters.map((newsletter) => (
                      <div
                        key={newsletter.id}
                        className="p-4 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-foreground">{newsletter.title}</h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteNewsletter(newsletter.id)}
                            className="text-destructive hover:text-destructive h-7 px-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                          {newsletter.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(newsletter.published_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "statistics" && isAdmin && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Members</p>
                      <p className="text-3xl font-bold text-foreground">{users.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <Clock className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Organization Total Hours</p>
                      <p className="text-3xl font-bold text-foreground">
                        {allSubmissions
                          .filter(s => s.status === "approved")
                          .reduce((sum, s) => sum + Number(s.hours), 0)
                          .toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Statistics */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">User Statistics</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Hours
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <AddHoursForm users={users} onSuccess={() => { fetchAllSubmissions(); fetchSubmissions(); }} />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="mb-4">
                  <Input
                    placeholder="Search members by name or email..."
                    value={statisticsSearch}
                    onChange={(e) => setStatisticsSearch(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <UserStatisticsList 
                  users={users} 
                  allSubmissions={allSubmissions} 
                  onDeleteSubmission={handleDeleteSubmission}
                  searchQuery={statisticsSearch}
                />
              </div>
            </div>
          )}

          {activeTab === "inbox" && (
            <div className="space-y-6">
              {/* Send Message Form (for all users) */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Send Message to Admins</h2>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="messageReason">Reason</Label>
                    <Select value={messageReason} onValueChange={setMessageReason} required>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="Event Proposal">Event Proposal</SelectItem>
                        <SelectItem value="Suggestion">Suggestion</SelectItem>
                        <SelectItem value="Concern">Concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messageSubject">Subject</Label>
                    <Input
                      id="messageSubject"
                      placeholder="Message subject"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messageDescription">Description</Label>
                    <Textarea
                      id="messageDescription"
                      placeholder="Write your message here..."
                      value={messageDescription}
                      onChange={(e) => setMessageDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={sendingMessage}>
                    <Send className="w-4 h-4" />
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>

              {/* My Sent Messages (for regular users) / All Messages (for admins) */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {isAdmin ? "All Messages" : "My Sent Messages"}
                </h2>
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No messages yet</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "p-4 rounded-lg border border-border",
                          !message.read && isAdmin ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">{message.subject}</h3>
                              {!message.read && isAdmin && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>
                              )}
                            </div>
                            {isAdmin && (
                              <p className="text-xs text-muted-foreground mt-1">
                                From: {message.user_name || message.user_email || "Unknown"}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isAdmin && !message.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkMessageRead(message.id)}
                                className="text-xs h-7 px-2"
                              >
                                Mark Read
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-destructive hover:text-destructive h-7 px-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{message.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meetings Tab */}
          {activeTab === "meetings" && (
            <div className="space-y-6">
              {/* Admin: Create Meeting */}
              {isAdmin && (
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Video className="w-5 h-5 text-primary" />
                      Create Zoom Meeting
                    </h2>
                    <Button
                      size="sm"
                      onClick={() => setShowMeetingForm((v) => !v)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {showMeetingForm ? "Cancel" : "New Meeting"}
                    </Button>
                  </div>
                  {showMeetingForm && (
                    <form onSubmit={handleCreateMeeting} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Meeting Title</Label>
                        <Input
                          placeholder="e.g. Weekly Team Sync"
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          placeholder="What is this meeting about?"
                          value={meetingDescription}
                          onChange={(e) => setMeetingDescription(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date & Time</Label>
                          <Input
                            type="datetime-local"
                            value={meetingStartTime}
                            onChange={(e) => setMeetingStartTime(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Select value={meetingDuration} onValueChange={setMeetingDuration}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="60">60 min</SelectItem>
                              <SelectItem value="90">90 min</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={creatingMeeting}>
                        {creatingMeeting ? "Creating..." : "Create Meeting"}
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* Meetings List */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Upcoming Meetings
                </h2>
                {meetings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No meetings scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {meetings.map((meeting) => {
                      const isPast = new Date(meeting.start_time) < new Date();
                      const details = meetingDetailsMap[meeting.id];
                      const attendeeNames = (details?.attendee_ids || []).map(id => {
                        const u = users.find(u => u.id === id);
                        return u?.full_name || u?.email || "Unknown";
                      });
                      return (
                        <div
                          key={meeting.id}
                          className={`rounded-lg border overflow-hidden ${
                            isPast ? "bg-muted/30 border-border opacity-80" : "bg-muted/50 border-border"
                          }`}
                        >
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                                {isPast && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    Past
                                  </span>
                                )}
                                {details && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    Details added
                                  </span>
                                )}
                              </div>
                              {meeting.description && (
                                <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  {new Date(meeting.start_time).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {meeting.duration_minutes} min
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {meeting.join_url && (() => {
                                const meetingEnd = new Date(new Date(meeting.start_time).getTime() + meeting.duration_minutes * 60000);
                                const oneDayAfterEnd = new Date(meetingEnd.getTime() + 24 * 60 * 60 * 1000);
                                return new Date() <= oneDayAfterEnd;
                              })() && (
                                <a href={meeting.join_url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" className="gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    Join
                                  </Button>
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => openDetailsDialog(meeting.id)}
                              >
                                <FileText className="w-4 h-4" />
                                Details
                              </Button>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteMeeting(meeting.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Inline summary visible to all */}
                          {details && (details.notes || (details.attendee_ids?.length ?? 0) > 0) && (
                            <div className="border-t border-border px-4 pb-4 pt-3 bg-background/40 space-y-2">
                              {details.notes && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Meeting Notes</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{details.notes}</p>
                                </div>
                              )}
                              {(details.attendee_ids?.length ?? 0) > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Attendees ({attendeeNames.length})
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {attendeeNames.map((name, i) => (
                                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Meeting Details Dialog */}
      <Dialog open={!!detailsDialogMeetingId} onOpenChange={(open) => !open && setDetailsDialogMeetingId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {isAdmin
                ? (meetingDetailsMap[detailsDialogMeetingId!]?.id ? "Edit Meeting Details" : "Add Meeting Details")
                : "Meeting Details"}
            </DialogTitle>
          </DialogHeader>
          {detailsDialogMeetingId && (() => {
            const details = meetingDetailsMap[detailsDialogMeetingId];
            const attendeeNames = (details?.attendee_ids || []).map(id => {
              const u = users.find(u => u.id === id);
              return u?.full_name || u?.email || "Unknown";
            });
            return isAdmin ? (
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Meeting Notes / Summary</Label>
                  <Textarea
                    placeholder="What was discussed in this meeting?"
                    value={detailsNotes}
                    onChange={(e) => setDetailsNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> Attendees
                  </Label>
                  <Input
                    placeholder="Search members..."
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-52 overflow-y-auto space-y-1 border border-border rounded-md p-2">
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">No members found</p>
                    ) : (
                      [...users]
                        .filter((u) => {
                          if (!attendeeSearch.trim()) return true;
                          const q = attendeeSearch.toLowerCase();
                          return (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
                        })
                        .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "")).map((u) => (
                        <label
                          key={u.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={detailsAttendees.includes(u.id)}
                            onChange={() => toggleAttendee(u.id)}
                            className="accent-primary"
                          />
                          <span className="text-sm text-foreground">{u.full_name || u.email || "Unknown"}</span>
                          {u.full_name && <span className="text-xs text-muted-foreground">{u.email}</span>}
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{detailsAttendees.length} selected</p>
                </div>
                <Button className="w-full" onClick={handleSaveMeetingDetails} disabled={savingDetails}>
                  {savingDetails ? "Saving..." : "Save Details"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                {details?.notes ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{details.notes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes added yet.</p>
                )}
                {(details?.attendee_ids?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Attendees
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {attendeeNames.map((name, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Image Enlarge Dialog */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {enlargedImage && (
            <img
              src={enlargedImage}
              alt="Enlarged submission"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={settingsNewPassword}
                onChange={(e) => setSettingsNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={settingsConfirmPassword}
                onChange={(e) => setSettingsConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button className="w-full" onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
