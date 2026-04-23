CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  content text NOT NULL,
  mood integer NOT NULL,
  energy_level integer,
  anxiety_level integer,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT journal_entries_mood_range CHECK (mood BETWEEN 1 AND 5),
  CONSTRAINT journal_entries_energy_range CHECK (energy_level IS NULL OR energy_level BETWEEN 1 AND 5),
  CONSTRAINT journal_entries_anxiety_range CHECK (anxiety_level IS NULL OR anxiety_level BETWEEN 1 AND 5)
);

CREATE INDEX idx_journal_entries_user_date ON public.journal_entries(user_id, entry_date DESC, created_at DESC);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own journal entries"
ON public.journal_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Clients can create their own journal entries"
ON public.journal_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can update their own journal entries"
ON public.journal_entries
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can delete their own journal entries"
ON public.journal_entries
FOR DELETE
USING (auth.uid() = user_id);

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  description text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_user_created_at ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.log_appointment_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, description, metadata)
    VALUES (
      NEW.user_id,
      'appointment_created',
      'appointment',
      NEW.id,
      'Appointment scheduled for ' || to_char(NEW.scheduled_for, 'Mon DD, YYYY at HH12:MI AM'),
      jsonb_build_object(
        'status', NEW.status,
        'service_type', NEW.service_type,
        'scheduled_for', NEW.scheduled_for,
        'session_mode', NEW.session_mode
      )
    );
    RETURN NEW;
  END IF;

  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, description, metadata)
    VALUES (
      NEW.user_id,
      'appointment_cancelled',
      'appointment',
      NEW.id,
      'Appointment cancelled for ' || to_char(COALESCE(NEW.scheduled_for, OLD.scheduled_for), 'Mon DD, YYYY at HH12:MI AM'),
      jsonb_build_object(
        'status', NEW.status,
        'service_type', NEW.service_type,
        'scheduled_for', NEW.scheduled_for,
        'cancellation_reason', NEW.cancellation_reason
      )
    );
    RETURN NEW;
  END IF;

  IF NEW.scheduled_for IS DISTINCT FROM OLD.scheduled_for
     OR NEW.session_mode IS DISTINCT FROM OLD.session_mode
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.reminder_enabled IS DISTINCT FROM OLD.reminder_enabled THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, description, metadata)
    VALUES (
      NEW.user_id,
      'appointment_rescheduled',
      'appointment',
      NEW.id,
      'Appointment updated to ' || to_char(NEW.scheduled_for, 'Mon DD, YYYY at HH12:MI AM'),
      jsonb_build_object(
        'previous_scheduled_for', OLD.scheduled_for,
        'scheduled_for', NEW.scheduled_for,
        'session_mode', NEW.session_mode,
        'status', NEW.status,
        'reminder_enabled', NEW.reminder_enabled
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_journal_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, description, metadata)
    VALUES (
      NEW.user_id,
      'journal_created',
      'journal_entry',
      NEW.id,
      'Wellbeing journal entry added',
      jsonb_build_object(
        'mood', NEW.mood,
        'energy_level', NEW.energy_level,
        'anxiety_level', NEW.anxiety_level,
        'entry_date', NEW.entry_date
      )
    );
    RETURN NEW;
  END IF;

  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, description, metadata)
  VALUES (
    NEW.user_id,
    'journal_updated',
    'journal_entry',
    NEW.id,
    'Wellbeing journal entry updated',
    jsonb_build_object(
      'mood', NEW.mood,
      'energy_level', NEW.energy_level,
      'anxiety_level', NEW.anxiety_level,
      'entry_date', NEW.entry_date
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER set_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER log_appointments_activity
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.log_appointment_activity();

CREATE TRIGGER log_journal_entries_activity
AFTER INSERT OR UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.log_journal_activity();