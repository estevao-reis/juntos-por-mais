CREATE TABLE public."Events" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  event_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public."EventRegistrations" (
  event_id uuid NOT NULL REFERENCES public."Events"(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
  leader_id uuid NULL REFERENCES public."Users"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE public."Events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EventRegistrations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage events" ON public."Events" FOR ALL
  USING (public.get_my_role() = 'ADMIN');

CREATE POLICY "Public and authenticated users can view events" ON public."Events" FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all registrations" ON public."EventRegistrations" FOR ALL
  USING (public.get_my_role() = 'ADMIN');

CREATE POLICY "Users can see their own registrations" ON public."EventRegistrations" FOR SELECT
  USING (user_id IN (SELECT id FROM public."Users" WHERE auth_id = auth.uid()));

CREATE POLICY "Leaders can see registrations they referred" ON public."EventRegistrations" FOR SELECT
  USING (leader_id IN (SELECT id FROM public."Users" WHERE auth_id = auth.uid()));