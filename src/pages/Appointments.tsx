import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock3, MapPin, NotebookText, RefreshCcw, ShieldCheck, Trash2, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Appointment = Tables<"appointments">;

const rescheduleSchema = z
  .object({
    date: z.date({ required_error: "Please choose a new date." }),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Enter a valid time."),
    sessionMode: z.enum(["virtual", "in-person", "phone"]),
    reminderEnabled: z.boolean(),
    notes: z.string().trim().max(500, "Keep notes under 500 characters.").optional(),
  })
  .refine(
    (value) => {
      const [hours, minutes] = value.time.split(":").map(Number);
      const scheduled = new Date(value.date);
      scheduled.setHours(hours, minutes, 0, 0);
      return scheduled.getTime() > Date.now();
    },
    {
      message: "Please choose a future time for the appointment.",
      path: ["time"],
    },
  );

const cancelSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Please share a short reason so the care team can assist you.")
    .max(300, "Keep the cancellation reason under 300 characters."),
});

const appointmentStatusLabel: Record<string, string> = {
  scheduled: "Scheduled",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
};

const getModeIcon = (mode: string) => {
  if (mode === "in-person") return MapPin;
  if (mode === "phone") return NotebookText;
  return Video;
};

const Appointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const rescheduleForm = useForm<z.infer<typeof rescheduleSchema>>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      time: "10:00",
      sessionMode: "virtual",
      reminderEnabled: true,
      notes: "",
    },
  });

  const cancelForm = useForm<z.infer<typeof cancelSchema>>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: "",
    },
  });

  const loadAppointments = async (userId: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["scheduled", "rescheduled"])
      .gte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true });

    if (error) {
      toast({
        title: "Unable to load appointments",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setAppointments(data ?? []);
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
      void loadAppointments(session.user.id);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        setLoading(false);
        return;
      }

      setUser(session.user);
      await loadAppointments(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const nextAppointment = useMemo(() => appointments[0] ?? null, [appointments]);

  const openReschedule = (appointment: Appointment) => {
    const scheduledDate = new Date(appointment.scheduled_for);
    const initialTime = format(scheduledDate, "HH:mm");

    setSelectedAppointment(appointment);
    rescheduleForm.reset({
      date: scheduledDate,
      time: initialTime,
      sessionMode: ["virtual", "in-person", "phone"].includes(appointment.session_mode)
        ? (appointment.session_mode as "virtual" | "in-person" | "phone")
        : "virtual",
      reminderEnabled: appointment.reminder_enabled,
      notes: appointment.notes ?? "",
    });
    setRescheduleOpen(true);
  };

  const openCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    cancelForm.reset({ reason: "" });
    setCancelOpen(true);
  };

  const handleReschedule = async (values: z.infer<typeof rescheduleSchema>) => {
    if (!selectedAppointment || !user) return;

    const [hours, minutes] = values.time.split(":").map(Number);
    const scheduledFor = new Date(values.date);
    scheduledFor.setHours(hours, minutes, 0, 0);

    setSaving(true);

    const { error } = await supabase.functions.invoke("manage-appointment", {
      body: {
        action: "reschedule",
        appointmentId: selectedAppointment.id,
        scheduledFor: scheduledFor.toISOString(),
        sessionMode: values.sessionMode,
        reminderEnabled: values.reminderEnabled,
        notes: values.notes?.trim() || null,
      },
    });

    setSaving(false);

    if (error) {
      toast({
        title: "Reschedule failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Appointment updated",
      description: "Your session has been rescheduled successfully.",
    });

    setRescheduleOpen(false);
    setSelectedAppointment(null);
    await loadAppointments(user.id);
  };

  const handleCancel = async (values: z.infer<typeof cancelSchema>) => {
    if (!selectedAppointment || !user) return;

    setSaving(true);

    const { error } = await supabase.functions.invoke("manage-appointment", {
      body: {
        action: "cancel",
        appointmentId: selectedAppointment.id,
        cancellationReason: values.reason,
      },
    });

    setSaving(false);

    if (error) {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Appointment cancelled",
      description: "Your upcoming session has been cancelled.",
    });

    setCancelOpen(false);
    setSelectedAppointment(null);
    await loadAppointments(user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-10 space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-0 shadow-card">
            <CardContent className="pt-8">
              <Badge variant="secondary" className="mb-4">Appointments</Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Manage your upcoming sessions</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                Review your confirmed sessions, adjust the schedule when plans change, and cancel with a quick update to the care team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => navigate("/contact")}>Book new session</Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/resources")}>Prepare for teletherapy</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>At a glance</CardTitle>
              <CardDescription>Your next session and support reminders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextAppointment ? (
                <>
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                    <p className="text-sm text-muted-foreground mb-1">Next session</p>
                    <p className="text-xl font-semibold text-foreground">{nextAppointment.service_type}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {format(new Date(nextAppointment.scheduled_for), "EEEE, MMMM d 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-accent/20 p-4">
                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm text-foreground">
                      If you need to change plans, please reschedule or cancel as early as possible so your care team can support you.
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-accent/20 p-4">
                  <p className="font-medium text-foreground">No upcoming sessions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Use the booking options to schedule your next appointment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Upcoming appointments</CardTitle>
              <CardDescription>Only future scheduled sessions appear here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-lg font-semibold text-foreground">You have no upcoming appointments</p>
                  <p className="text-muted-foreground mt-2 mb-4">When you book a session, it will show up here with options to reschedule or cancel.</p>
                  <Button onClick={() => navigate("/contact")}>Request appointment</Button>
                </div>
              ) : (
                appointments.map((appointment) => {
                  const ModeIcon = getModeIcon(appointment.session_mode);

                  return (
                    <div
                      key={appointment.id}
                      className="rounded-xl border border-border/60 bg-background/80 p-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">{appointment.service_type}</h2>
                          <Badge variant="secondary">{appointmentStatusLabel[appointment.status] ?? appointment.status}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">with {appointment.therapist_name}</p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            {format(new Date(appointment.scheduled_for), "EEEE, MMMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock3 className="h-4 w-4 text-primary" />
                            {format(new Date(appointment.scheduled_for), "h:mm a")} · {appointment.duration_minutes} min
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                            <ModeIcon className="h-4 w-4 text-primary" />
                            {appointment.session_mode}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Reminders {appointment.reminder_enabled ? "enabled" : "paused"}
                          </div>
                        </div>

                        {appointment.location && (
                          <p className="text-sm text-muted-foreground">Location: {appointment.location}</p>
                        )}
                        {appointment.meeting_link && (
                          <a
                            href={appointment.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-sm text-primary hover:underline"
                          >
                            Open meeting link
                          </a>
                        )}
                        {appointment.notes && <p className="text-sm text-muted-foreground">Notes: {appointment.notes}</p>}
                        {appointment.rescheduled_from && (
                          <p className="text-sm text-muted-foreground">
                            Previously scheduled for {format(new Date(appointment.rescheduled_from), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-48">
                        <Button onClick={() => openReschedule(appointment)}>
                          <RefreshCcw className="h-4 w-4" />
                          Reschedule
                        </Button>
                        <Button variant="outline" onClick={() => openCancel(appointment)}>
                          <Trash2 className="h-4 w-4" />
                          Cancel session
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </section>

        <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule appointment</DialogTitle>
              <DialogDescription>Choose a new time and update how you’d like to attend this session.</DialogDescription>
            </DialogHeader>

            <Form {...rescheduleForm}>
              <form onSubmit={rescheduleForm.handleSubmit(handleReschedule)} className="space-y-4">
                <FormField
                  control={rescheduleForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>New date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rescheduleForm.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rescheduleForm.control}
                  name="sessionMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a session mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="in-person">In-person</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rescheduleForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes for the care team</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} placeholder="Share anything the team should know about the change." />
                      </FormControl>
                      <FormDescription>Optional details such as preferred format or timing notes.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rescheduleForm.control}
                  name="reminderEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                      <div>
                        <FormLabel>Appointment reminders</FormLabel>
                        <FormDescription>Keep email reminders enabled for this session.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setRescheduleOpen(false)}>Close</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel appointment</DialogTitle>
              <DialogDescription>Let the care team know why you need to cancel this session.</DialogDescription>
            </DialogHeader>

            <Form {...cancelForm}>
              <form onSubmit={cancelForm.handleSubmit(handleCancel)} className="space-y-4">
                <FormField
                  control={cancelForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation reason</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Please share a brief reason for cancelling." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>Keep appointment</Button>
                  <Button type="submit" variant="destructive" disabled={saving}>{saving ? "Cancelling..." : "Cancel session"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Appointments;