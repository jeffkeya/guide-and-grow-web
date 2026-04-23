import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const manageAppointmentSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("reschedule"),
    appointmentId: z.string().uuid(),
    scheduledFor: z.string().datetime(),
    sessionMode: z.enum(["virtual", "in-person", "phone"]),
    reminderEnabled: z.boolean(),
    notes: z.string().trim().max(500).optional().nullable(),
  }),
  z.object({
    action: z.literal("cancel"),
    appointmentId: z.string().uuid(),
    cancellationReason: z.string().trim().min(10).max(300),
  }),
]);

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");

  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    return jsonResponse({ error: "Server configuration is incomplete" }, 500);
  }

  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization header" }, 401);
  }

  const authClient = createClient(supabaseUrl, publishableKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const parsed = manageAppointmentSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return jsonResponse({ error: parsed.error.flatten().fieldErrors }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: appointment, error: appointmentError } = await adminClient
    .from("appointments")
    .select("id, user_id, status, scheduled_for")
    .eq("id", parsed.data.appointmentId)
    .single();

  if (appointmentError || !appointment) {
    return jsonResponse({ error: "Appointment not found" }, 404);
  }

  if (appointment.user_id !== user.id) {
    return jsonResponse({ error: "You cannot modify this appointment" }, 403);
  }

  if (!["scheduled", "rescheduled"].includes(appointment.status)) {
    return jsonResponse({ error: "Only upcoming appointments can be updated" }, 400);
  }

  if (parsed.data.action === "reschedule") {
    const nextTime = new Date(parsed.data.scheduledFor);

    if (Number.isNaN(nextTime.getTime()) || nextTime.getTime() <= Date.now()) {
      return jsonResponse({ error: "Please choose a future appointment time" }, 400);
    }

    const { error: updateError } = await adminClient
      .from("appointments")
      .update({
        scheduled_for: parsed.data.scheduledFor,
        session_mode: parsed.data.sessionMode,
        reminder_enabled: parsed.data.reminderEnabled,
        notes: parsed.data.notes?.trim() ? parsed.data.notes.trim() : null,
        rescheduled_from: appointment.scheduled_for,
        status: "rescheduled",
        cancellation_reason: null,
      })
      .eq("id", parsed.data.appointmentId)
      .eq("user_id", user.id);

    if (updateError) {
      return jsonResponse({ error: "Unable to reschedule appointment" }, 500);
    }

    return jsonResponse({ success: true });
  }

  const { error: cancelError } = await adminClient
    .from("appointments")
    .update({
      status: "cancelled",
      cancellation_reason: parsed.data.cancellationReason.trim(),
    })
    .eq("id", parsed.data.appointmentId)
    .eq("user_id", user.id);

  if (cancelError) {
    return jsonResponse({ error: "Unable to cancel appointment" }, 500);
  }

  return jsonResponse({ success: true });
});