CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  therapist_name text NOT NULL,
  service_type text NOT NULL,
  session_mode text NOT NULL DEFAULT 'virtual',
  scheduled_for timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 50,
  location text,
  meeting_link text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  cancellation_reason text,
  reminder_enabled boolean NOT NULL DEFAULT true,
  rescheduled_from timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_scheduled_for ON public.appointments(scheduled_for);
CREATE INDEX idx_appointments_user_status_scheduled ON public.appointments(user_id, status, scheduled_for);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own appointments"
ON public.appointments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Clients can create their own appointments"
ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can update their own appointments"
ON public.appointments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can delete their own appointments"
ON public.appointments
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER set_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();