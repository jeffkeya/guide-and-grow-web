import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  ListChecks,
  MessageCircleHeart,
  Phone,
  ShieldAlert,
  Sparkles,
  Video,
} from "lucide-react";

const dashboardStats = [
  {
    label: "Upcoming session",
    value: "Tue, 10:00 AM",
    detail: "Online consultation confirmed",
    icon: Calendar,
    iconClassName: "text-primary",
    surfaceClassName: "bg-primary/10",
  },
  {
    label: "Care plan progress",
    value: "78%",
    detail: "Weekly goals are on track",
    icon: ListChecks,
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
];

const upcomingAppointments = [
  {
    title: "Individual therapy session",
    time: "Tuesday · 10:00 AM",
    mode: "Secure video session",
    therapist: "Japheth Billy",
    badge: "Confirmed",
  },
  {
    title: "Mood and progress review",
    time: "Thursday · 3:30 PM",
    mode: "In-person follow-up",
    therapist: "Wellness care team",
    badge: "Reminder set",
  },
];

const wellbeingTools = [
  {
    title: "Journal reflections",
    description: "Capture your mood, thoughts, and small wins before your next session.",
    icon: BookOpen,
    action: "Start writing",
    route: "/resources",
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

const carePlanSteps = [
  "Complete your intake reflection before the next consultation.",
  "Track your mood for three days this week.",
  "Review coping strategies shared in your last session.",
  "Book your next follow-up to keep momentum going.",
];

const supportLinks = [
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const firstName = user?.email?.split("@")[0]?.replace(/[._-]/g, " ") || "friend";

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

      <main className="container mx-auto px-4 py-8 md:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <Card className="border-0 shadow-card">
            <CardContent className="pt-8">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <Badge variant="secondary" className="px-3 py-1">
                  Client dashboard
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Calm, secure, guided support
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4 capitalize">
                Welcome back, {firstName}
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                Stay on top of upcoming sessions, wellness goals, and support resources from one place.
                ThriveSpace is here to help you move forward with clarity, care, and community.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <a href="/contact">
                    Book consultation
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/resources">Explore resources</a>
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
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

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mt-8">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Upcoming appointments</CardTitle>
              <CardDescription>Keep track of confirmed sessions and reminders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={`${appointment.title}-${appointment.time}`}
                  className="flex flex-col gap-4 rounded-lg border border-border/60 bg-background/80 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{appointment.title}</p>
                      <Badge variant="secondary">{appointment.badge}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.therapist}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-primary" />
                        {appointment.time}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        {appointment.mode}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => navigate("/contact")}>
                    Manage booking
                  </Button>
                </div>
              ))}
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

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] mt-8">
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
                  <Button variant="ghost" className="px-0" onClick={() => navigate(tool.route)}>
                    {tool.action}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Support access</CardTitle>
              <CardDescription>Quick links for care, communication, and guidance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
      </main>
    </div>
  );
};

export default Dashboard;
