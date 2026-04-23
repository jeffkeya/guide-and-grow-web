import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowRight,
  BookHeart,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  ListChecks,
  Loader2,
  MessageCircleHeart,
  Phone,
  ShieldAlert,
  Sparkles,
  Video,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Appointment = Tables<"appointments">;
type JournalEntry = Tables<"journal_entries">;
type ActivityLog = Tables<"activity_logs">;

const journalSchema = z.object({
  title: z.string().trim().max(80, "Keep the title under 80 characters.").optional(),
  mood: z.enum(["1", "2", "3", "4", "5"]),
  energyLevel: z.enum(["1", "2", "3", "4", "5"]).optional(),
  anxietyLevel: z.enum(["1", "2", "3", "4", "5"]).optional(),
  content: z.string().trim().min(12, "Write at least a short reflection.").max(1200, "Keep your reflection under 1200 characters."),
});

const moodMeta: Record<number, { label: string; tone: string }> = {
  1: { label: "Very low", tone: "bg-destructive/10 text-destructive" },
  2: { label: "Low", tone: "bg-accent/30 text-accent-foreground" },
  3: { label: "Steady", tone: "bg-secondary text-secondary-foreground" },
  4: { label: "Good", tone: "bg-healing-green/10 text-healing-green" },
  5: { label: "Excellent", tone: "bg-primary/10 text-primary" },
};

const carePlanSteps = [
  "Complete your intake reflection before the next consultation.",
  "Track your mood for three days this week.",
  "Review coping strategies shared in your last session.",
  "Book your next follow-up to keep momentum going.",
];

const wellbeingTools = [
  {
    title: "Journal reflections",
    description: "Capture your mood, thoughts, and small wins between sessions.",
    icon: BookHeart,
    action: "Save check-in below",
    route: "#journal",
  },
  {
    title: "Breathing reset",
    description: "Take a guided pause with grounding exercises you can use anytime.",
    icon: Brain,
    action: "View resources",
    route: "/resources",
  },
  {
    title: "Message support",
    description: "Reach out with non-urgent questions and receive follow-up guidance.",
    icon: MessageCircleHeart,
    action: "Contact support",
    route: "/contact",
  },
];

const supportLinks = [
  {
    title: "Manage appointments",
    description: "Review your confirmed sessions, move a booking, or cancel when plans change.",
    icon: Calendar,
    route: "/appointments",
  },
  {
    title: "Book a consultation",
    description: "Schedule a therapy session or wellbeing check-in.",
    icon: Calendar,
    route: "/contact",
  },
  {
    title: "Join a group session",
    description: "Explore community-based support and guided peer spaces.",
    icon: HeartHandshake,
    route: "/services",
  },
  {
    title: "Teletherapy access",
    description: "Prepare for your upcoming online session and session etiquette.",
    icon: Video,
    route: "/resources",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingJournal, setSavingJournal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const journalForm = useForm<z.infer<typeof journalSchema>>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      mood: "3",
      energyLevel: "3",
      anxietyLevel: "3",
      content: "",
    },
  });

  const loadDashboardData = async (userId: string) => {
    const [appointmentsResult, journalResult, activityResult] = await Promise.all([
      supabase
        .from("appointments")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["scheduled", "rescheduled"])
        .gte("scheduled_for", new Date().toISOString())
        .order("scheduled_for", { ascending: true })
        .limit(2),
      supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (appointmentsResult.error) {
      toast({ title: "Unable to load appointments", description: appointmentsResult.error.message, variant: "destructive" });
    } else {
      setAppointments(appointmentsResult.data ?? []);
    }

    if (journalResult.error) {
      toast({ title: "Unable to load journal entries", description: journalResult.error.message, variant: "destructive" });
    } else {
      setJournalEntries(journalResult.data ?? []);
    }

    if (activityResult.error) {
      toast({ title: "Unable to load activity log", description: activityResult.error.message, variant: "destructive" });
    } else {
      setActivityLogs(activityResult.data ?? []);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        navigate("/login");
        return;
      }

      setUser(session.user);
      void loadDashboardData(session.user.id);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        setLoading(false);
        return;
      }

      setUser(session.user);
      await loadDashboardData(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const firstName = user?.email?.split("@")[0]?.replace(/[._-]/g, " ") || "friend";
  const nextAppointment = appointments[0] ?? null;

  const dashboardStats = useMemo(
    () => [
      {
        label: "Upcoming session",
        value: nextAppointment ? format(new Date(nextAppointment.scheduled_for), "EEE, h:mm a") : "None booked",
        detail: nextAppointment ? `${nextAppointment.service_type} with ${nextAppointment.therapist_name}` : "Schedule your next consultation anytime",
        icon: Calendar,
        iconClassName: "text-primary",
        surfaceClassName: "bg-primary/10",
      },
      {
        label: "Latest mood",
        value: journalEntries[0] ? moodMeta[journalEntries[0].mood]?.label ?? `${journalEntries[0].mood}/5` : "No check-in",
        detail: journalEntries[0] ? `Logged ${format(new Date(journalEntries[0].created_at), "MMM d")}` : "Add your first wellbeing entry below",
        icon: BookOpen,
        iconClassName: "text-healing-green",
        surfaceClassName: "bg-healing-green/10",
      },
      {
        label: "Support availability",
        value: "24/7",
        detail: "Crisis and check-in resources",
        icon: ShieldAlert,
        iconClassName: "text-accent-foreground",
        surfaceClassName: "bg-accent/30",
      },
    ],
    [journalEntries, nextAppointment],
  );

  const handleJournalSubmit = async (values: z.infer<typeof journalSchema>) => {
    if (!user) return;

    const payload: TablesInsert<"journal_entries"> = {
      user_id: user.id,
      title: values.title?.trim() || null,
      content: values.content.trim(),
      mood: Number(values.mood),
      energy_level: values.energyLevel ? Number(values.energyLevel) : null,
      anxiety_level: values.anxietyLevel ? Number(values.anxietyLevel) : null,
    };

    setSavingJournal(true);
    const { error } = await supabase.from("journal_entries").insert(payload);
    setSavingJournal(false);

    if (error) {
      toast({ title: "Could not save journal entry", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Wellbeing check-in saved", description: "Your journal entry has been added securely." });
    journalForm.reset({ title: "", mood: "3", energyLevel: "3", anxietyLevel: "3", content: "" });
    await loadDashboardData(user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-10 space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <Card className="border-0 shadow-card">
            <CardContent className="pt-8">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <Badge variant="secondary" className="px-3 py-1">Client dashboard</Badge>
                <Badge variant="outline" className="px-3 py-1">Calm, secure, guided support</Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4 capitalize">
                Welcome back, {firstName}
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                Stay on top of upcoming sessions, mood check-ins, and your recent care activity from one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <a href="/appointments">
                    Manage appointments
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#journal">Add check-in</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Today’s focus</CardTitle>
              <CardDescription>Simple next steps to support your week.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carePlanSteps.slice(0, 3).map((step) => (
                <div key={step} className="flex items-start gap-3 rounded-lg bg-accent/20 p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground leading-6">{step}</p>
                </div>
              ))}

              <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Need urgent help?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      If you are in immediate danger or crisis, contact local emergency services right away.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboardStats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-2">{stat.detail}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.surfaceClassName}`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconClassName}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Upcoming appointments</CardTitle>
              <CardDescription>Keep track of confirmed sessions and reminders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-lg font-semibold text-foreground">No upcoming sessions yet</p>
                  <p className="text-muted-foreground mt-2 mb-4">Your next confirmed appointments will appear here.</p>
                  <Button onClick={() => navigate("/contact")}>Request appointment</Button>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-4 rounded-lg border border-border/60 bg-background/80 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{appointment.service_type}</p>
                        <Badge variant="secondary">{appointment.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.therapist_name}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-primary" />
                          {format(new Date(appointment.scheduled_for), "EEE, MMM d · h:mm a")}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Video className="h-4 w-4 text-primary" />
                          {appointment.session_mode}
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" onClick={() => navigate("/appointments")}>Manage booking</Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Care plan checklist</CardTitle>
              <CardDescription>Helpful milestones between sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {carePlanSteps.map((step) => (
                <div key={step} className="flex items-start gap-3 rounded-lg bg-accent/20 p-3">
                  <CheckCircle2 className="h-4 w-4 text-healing-green mt-1" />
                  <p className="text-sm text-foreground">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="journal" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Wellbeing journal & mood check-in</CardTitle>
              <CardDescription>Save a simple reflection so you and your care team can spot patterns over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...journalForm}>
                <form onSubmit={journalForm.handleSubmit(handleJournalSubmit)} className="space-y-4">
                  <FormField
                    control={journalForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="A quick note for today" />
                        </FormControl>
                        <FormDescription>Optional and visible only within your account.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={journalForm.control}
                      name="mood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mood</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose mood" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(moodMeta).map(([value, meta]) => (
                                <SelectItem key={value} value={value}>{value} · {meta.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={journalForm.control}
                      name="energyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Energy</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="1 to 5" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((value) => (
                                <SelectItem key={value} value={String(value)}>{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={journalForm.control}
                      name="anxietyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anxiety</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="1 to 5" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((value) => (
                                <SelectItem key={value} value={String(value)}>{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={journalForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reflection</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What stood out today? What helped? What felt hard?"
                            className="min-h-[140px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={savingJournal}>
                    {savingJournal ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookHeart className="h-4 w-4" />}
                    Save check-in
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Recent journal entries</CardTitle>
              <CardDescription>Your latest mood check-ins and reflections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {journalEntries.length === 0 ? (
                <div className="rounded-lg bg-accent/20 p-4">
                  <p className="font-medium text-foreground">No journal entries yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Your saved check-ins will appear here after the first entry.</p>
                </div>
              ) : (
                journalEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border/60 bg-background/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <p className="font-semibold text-foreground">{entry.title || "Wellbeing check-in"}</p>
                      <Badge className={moodMeta[entry.mood]?.tone}>{moodMeta[entry.mood]?.label ?? `${entry.mood}/5`}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{format(new Date(entry.created_at), "MMM d, yyyy · h:mm a")}</p>
                    <p className="text-sm text-muted-foreground line-clamp-4">{entry.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Wellbeing tools</CardTitle>
              <CardDescription>Resources you can use anytime between appointments.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {wellbeingTools.map((tool) => (
                <div key={tool.title} className="rounded-lg border border-border/60 bg-background/70 p-4">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  <Button
                    variant="ghost"
                    className="px-0"
                    onClick={() => (tool.route.startsWith("#") ? document.getElementById("journal")?.scrollIntoView({ behavior: "smooth" }) : navigate(tool.route))}
                  >
                    {tool.action}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Audit activity log</CardTitle>
              <CardDescription>A recent record of journal and appointment actions on your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityLogs.length === 0 ? (
                <div className="rounded-lg bg-accent/20 p-4">
                  <p className="font-medium text-foreground">No recent activity yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Saved journal entries and appointment updates will appear here.</p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg bg-background/70 border border-border/60 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <ListChecks className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.created_at), "MMM d, yyyy · h:mm a")} · {log.entity_type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">A steady path matters</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Small, consistent steps often create the strongest healing progress over time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Support access</CardTitle>
              <CardDescription>Quick links for care, communication, and guidance.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {supportLinks.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className="flex w-full items-start gap-4 rounded-lg border border-border/60 bg-background/70 p-4 text-left transition-colors hover:bg-accent/20"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/60">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;