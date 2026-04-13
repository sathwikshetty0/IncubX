-- IncubX Complete Supabase Schema (Production Ready)

-- ============================================================
-- 1. EXTENSIONS & ENUMS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM (
      'super_admin', 'admin', 'ceo', 'program_incharge', 'finance_id',
      'primary_mentor', 'sector_expert', 'product_expert', 'marketing_expert',
      'legal_finance', 'general_mentor', 'premium_mentor',
      'team_lead', 'team_member', 'alumni', 'investor', 'applicant'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  tagline TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id),
  email TEXT,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'blocked', 'alumni')),
  photo_url TEXT,
  bio TEXT,
  phone TEXT,
  linkedin TEXT,
  github TEXT,
  twitter TEXT,
  website TEXT,
  disc_type TEXT,
  disc_d NUMERIC DEFAULT 0,
  disc_i NUMERIC DEFAULT 0,
  disc_s NUMERIC DEFAULT 0,
  disc_c NUMERIC DEFAULT 0,
  disc_completed BOOLEAN NOT NULL DEFAULT false,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  individual_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. ASSESSMENTS & ANALYTICS
-- ============================================================

-- DISC results
CREATE TABLE IF NOT EXISTS public.disc_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  d_score NUMERIC NOT NULL DEFAULT 0,
  i_score NUMERIC NOT NULL DEFAULT 0,
  s_score NUMERIC NOT NULL DEFAULT 0,
  c_score NUMERIC NOT NULL DEFAULT 0,
  primary_type TEXT,
  secondary_type TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.disc_results ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. ACADEMIC & INCUBATION
-- ============================================================

-- Programs
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pre_incubation', 'incubation', 'acceleration')),
  incharge_id UUID REFERENCES auth.users(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Cohorts
CREATE TABLE IF NOT EXISTS public.cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  enrollment_link TEXT,
  budget_per_team NUMERIC DEFAULT 0,
  default_credits INTEGER DEFAULT 100,
  release_type TEXT DEFAULT 'full_upfront' CHECK (release_type IN ('full_upfront', 'milestone_based')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- Sprints table (phases within a cohort)
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sprint_number INTEGER NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- Gates table (checkpoints between sprints)
CREATE TABLE IF NOT EXISTS public.gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  required_score NUMERIC DEFAULT 0,
  sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. TEAMS & MEMBERS
-- ============================================================

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.cohorts(id),
  name TEXT NOT NULL,
  product_name TEXT,
  stage TEXT DEFAULT 'idea' CHECK (stage IN ('idea', 'mvp', 'early_traction', 'growth')),
  logo_url TEXT,
  website TEXT,
  description TEXT,
  problem_overview TEXT,
  solution_overview TEXT,
  generated_overview TEXT,
  budget_allocated NUMERIC DEFAULT 0,
  budget_used NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('applicant', 'active', 'suspended', 'alumni')),
  investor_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_in_team TEXT NOT NULL DEFAULT 'member' CHECK (role_in_team IN ('lead', 'member')),
  status TEXT NOT NULL DEFAULT 'approved',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. MENTORSHIP
-- ============================================================

-- Mentor assignments
CREATE TABLE IF NOT EXISTS public.mentor_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (team_id, mentor_id)
);
ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;

-- Mentor availability slots
CREATE TABLE IF NOT EXISTS public.mentor_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  meet_link TEXT,
  session_type TEXT NOT NULL DEFAULT 'online',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_slots ENABLE ROW LEVEL SECURITY;

-- Mentor bookings
CREATE TABLE IF NOT EXISTS public.mentor_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID REFERENCES public.mentor_slots(id) ON DELETE SET NULL,
  mentor_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  booked_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  mentor_notes TEXT,
  meet_link TEXT,
  meeting_type TEXT NOT NULL DEFAULT 'online',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_bookings ENABLE ROW LEVEL SECURITY;

-- Mentor session notes
CREATE TABLE IF NOT EXISTS public.mentor_session_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.mentor_bookings(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  action_items TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_session_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. LMS & DELIVERABLES
-- ============================================================

-- LMS Modules table
CREATE TABLE IF NOT EXISTS public.lms_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT,
  content_type TEXT NOT NULL DEFAULT 'video',
  sequence INTEGER NOT NULL DEFAULT 1,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_modules ENABLE ROW LEVEL SECURITY;

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT NOT NULL DEFAULT 'file_upload',
  max_score NUMERIC DEFAULT 100,
  due_date TIMESTAMPTZ,
  sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL,
  file_url TEXT,
  file_name TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  score NUMERIC,
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, team_id)
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. OPERATIONS & ENGAGEMENT
-- ============================================================

-- Gate results per team
CREATE TABLE IF NOT EXISTS public.gate_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gate_id UUID NOT NULL REFERENCES public.gates(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  score NUMERIC DEFAULT 0,
  feedback TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gate_id, team_id)
);
ALTER TABLE public.gate_results ENABLE ROW LEVEL SECURITY;

-- Resource requests
CREATE TABLE IF NOT EXISTS public.resource_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'miscellaneous',
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  mentor_approved_by UUID,
  mentor_approved_at TIMESTAMPTZ,
  expert_approved_by UUID,
  expert_approved_at TIMESTAMPTZ,
  finance_processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;

-- Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  published_by UUID NOT NULL,
  target_roles TEXT[] DEFAULT '{}',
  target_cohorts UUID[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Cohort applications
CREATE TABLE IF NOT EXISTS public.cohort_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.cohort_applications ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Team activity log
CREATE TABLE IF NOT EXISTS public.team_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;

-- Investor watchlist
CREATE TABLE IF NOT EXISTS public.investor_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(investor_id, team_id)
);
ALTER TABLE public.investor_watchlist ENABLE ROW LEVEL SECURITY;

-- Investor messages
CREATE TABLE IF NOT EXISTS public.investor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_messages ENABLE ROW LEVEL SECURITY;

-- Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  cohort_id UUID REFERENCES public.cohorts(id),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  certificate_type TEXT NOT NULL DEFAULT 'completion',
  title TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certificate_url TEXT
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Honorariums
CREATE TABLE IF NOT EXISTS public.honorariums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  month TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.honorariums ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_above(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin', 'ceo', 'program_incharge')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_mentor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('primary_mentor', 'sector_expert', 'product_expert', 'marketing_expert', 'legal_finance', 'general_mentor', 'premium_mentor')
  )
$$;

-- Global updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- 10. TRIGGERS
-- ============================================================

-- Profile updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role public.app_role;
  _org_id UUID;
BEGIN
  -- Get role from metadata
  _role := (NEW.raw_user_meta_data->>'role')::public.app_role;
  
  -- Get org_id from metadata or find by name
  _org_id := (NEW.raw_user_meta_data->>'org_id')::UUID;
  IF _org_id IS NULL AND NEW.raw_user_meta_data->>'org_name' IS NOT NULL THEN
     SELECT id INTO _org_id FROM public.organizations WHERE name = NEW.raw_user_meta_data->>'org_name' LIMIT 1;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name, org_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    _org_id
  );

  -- Assign role if provided
  IF _role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Submission updated_at
DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mentor bookings updated_at
DROP TRIGGER IF EXISTS update_mentor_bookings_updated_at ON public.mentor_bookings;
CREATE TRIGGER update_mentor_bookings_updated_at
  BEFORE UPDATE ON public.mentor_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Resource requests updated_at
DROP TRIGGER IF EXISTS update_resource_requests_updated_at ON public.resource_requests;
CREATE TRIGGER update_resource_requests_updated_at
  BEFORE UPDATE ON public.resource_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 11. RLS POLICIES
-- ============================================================

-- Organizations: anyone authenticated can view, admins can modify
DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;
CREATE POLICY "Anyone can view organizations" ON public.organizations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()));

-- User roles: users can see their own, admins can manage all in org
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()));

-- Profiles: Own profile + same org members community access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Same org users can view profiles" ON public.profiles;
CREATE POLICY "Same org users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (org_id = get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins and mentors can view org profiles" ON public.profiles;
CREATE POLICY "Admins and mentors can view org profiles" ON public.profiles FOR SELECT TO authenticated USING ((org_id = public.get_user_org_id(auth.uid())) AND (public.is_admin_or_above(auth.uid()) OR public.is_mentor(auth.uid())));
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()));

-- DISC results: own only + admins
DROP POLICY IF EXISTS "Users can view own disc" ON public.disc_results;
CREATE POLICY "Users can view own disc" ON public.disc_results FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own disc" ON public.disc_results;
CREATE POLICY "Users can insert own disc" ON public.disc_results FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can view disc" ON public.disc_results;
CREATE POLICY "Admins can view disc" ON public.disc_results FOR SELECT TO authenticated USING (public.is_admin_or_above(auth.uid()));

-- Programs: same org can view, admins can manage
DROP POLICY IF EXISTS "Same org can view programs" ON public.programs;
CREATE POLICY "Same org can view programs" ON public.programs FOR SELECT TO authenticated USING (org_id = public.get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Admins can manage programs" ON public.programs FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()) AND org_id = public.get_user_org_id(auth.uid()));

-- Cohorts: same org can view, admins can manage
DROP POLICY IF EXISTS "Same org can view cohorts" ON public.cohorts;
CREATE POLICY "Same org can view cohorts" ON public.cohorts FOR SELECT TO authenticated USING (org_id = public.get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;
CREATE POLICY "Admins can manage cohorts" ON public.cohorts FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()) AND org_id = public.get_user_org_id(auth.uid()));

-- Teams: same org can view, admins can manage, team leads can update
DROP POLICY IF EXISTS "Same org can view teams" ON public.teams;
CREATE POLICY "Same org can view teams" ON public.teams FOR SELECT TO authenticated USING (org_id = public.get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()) AND org_id = public.get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Team leads can update own team" ON public.teams;
CREATE POLICY "Team leads can update own team" ON public.teams FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role_in_team = 'lead')) WITH CHECK (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role_in_team = 'lead'));
DROP POLICY IF EXISTS "Investors can view visible teams" ON public.teams;
CREATE POLICY "Investors can view visible teams" ON public.teams FOR SELECT TO authenticated USING (investor_visible = true AND has_role(auth.uid(), 'investor'::app_role));

-- Team members: team members can view their team, admins can manage
DROP POLICY IF EXISTS "Team members can view own team members" ON public.team_members;
CREATE POLICY "Team members can view own team members" ON public.team_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()));

-- Mentor assignments: mentors see own, teams see own, admins manage
DROP POLICY IF EXISTS "Mentors can view own assignments" ON public.mentor_assignments;
CREATE POLICY "Mentors can view own assignments" ON public.mentor_assignments FOR SELECT TO authenticated USING (mentor_id = auth.uid());
DROP POLICY IF EXISTS "Team members can view mentor assignments" ON public.mentor_assignments;
CREATE POLICY "Team members can view mentor assignments" ON public.mentor_assignments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = mentor_assignments.team_id AND tm.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can manage mentor assignments" ON public.mentor_assignments;
CREATE POLICY "Admins can manage mentor assignments" ON public.mentor_assignments FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()));

-- Mentor slots & bookings
DROP POLICY IF EXISTS "Mentors can manage own slots" ON public.mentor_slots;
CREATE POLICY "Mentors can manage own slots" ON public.mentor_slots FOR ALL TO authenticated USING (mentor_id = auth.uid());
DROP POLICY IF EXISTS "Authenticated can view available slots" ON public.mentor_slots;
CREATE POLICY "Authenticated can view available slots" ON public.mentor_slots FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Mentors can manage their bookings" ON public.mentor_bookings;
CREATE POLICY "Mentors can manage their bookings" ON public.mentor_bookings FOR ALL TO authenticated USING (mentor_id = auth.uid());
DROP POLICY IF EXISTS "Team members can view own team bookings" ON public.mentor_bookings;
CREATE POLICY "Team members can view own team bookings" ON public.mentor_bookings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = mentor_bookings.team_id AND tm.user_id = auth.uid()));
DROP POLICY IF EXISTS "Team members can create bookings" ON public.mentor_bookings;
CREATE POLICY "Team members can create bookings" ON public.mentor_bookings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = mentor_bookings.team_id AND tm.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.mentor_bookings;
CREATE POLICY "Admins can manage all bookings" ON public.mentor_bookings FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Mentor session notes
DROP POLICY IF EXISTS "Mentors can manage assigned team session notes" ON public.mentor_session_notes;
CREATE POLICY "Mentors can manage assigned team session notes" ON public.mentor_session_notes FOR ALL USING (mentor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.mentor_assignments ma WHERE ma.mentor_id = auth.uid() AND ma.team_id = mentor_session_notes.team_id));
DROP POLICY IF EXISTS "Team members can view own session notes" ON public.mentor_session_notes;
CREATE POLICY "Team members can view own session notes" ON public.mentor_session_notes FOR SELECT USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = mentor_session_notes.team_id AND tm.user_id = auth.uid()));

-- Assignments & Submissions
DROP POLICY IF EXISTS "Same org can view assignments" ON public.assignments;
CREATE POLICY "Same org can view assignments" ON public.assignments FOR SELECT TO authenticated USING (org_id = public.get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.assignments;
CREATE POLICY "Admins can manage assignments" ON public.assignments FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()) AND org_id = get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage submissions" ON public.submissions;
CREATE POLICY "Admins can manage submissions" ON public.submissions FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));
DROP POLICY IF EXISTS "Team members can insert submissions" ON public.submissions;
CREATE POLICY "Team members can insert submissions" ON public.submissions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = submissions.team_id AND tm.user_id = auth.uid()));
DROP POLICY IF EXISTS "Team members can view own submissions" ON public.submissions;
CREATE POLICY "Team members can view own submissions" ON public.submissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = submissions.team_id AND tm.user_id = auth.uid()));
DROP POLICY IF EXISTS "Mentors can view assigned team submissions" ON public.submissions;
CREATE POLICY "Mentors can view assigned team submissions" ON public.submissions FOR SELECT TO authenticated USING (is_mentor(auth.uid()) AND EXISTS (SELECT 1 FROM mentor_assignments ma WHERE ma.team_id = submissions.team_id AND ma.mentor_id = auth.uid()));
DROP POLICY IF EXISTS "Mentors can grade submissions" ON public.submissions;
CREATE POLICY "Mentors can grade submissions" ON public.submissions FOR UPDATE TO authenticated USING (is_mentor(auth.uid()) AND EXISTS (SELECT 1 FROM mentor_assignments ma WHERE ma.team_id = submissions.team_id AND ma.mentor_id = auth.uid()));

-- Notifications & Activity Log
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_above(auth.uid()) OR public.is_mentor(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "Team members can view activity" ON public.team_activity_log;
CREATE POLICY "Team members can view activity" ON public.team_activity_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_activity_log.team_id AND tm.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins and team members can insert activity" ON public.team_activity_log;
CREATE POLICY "Admins and team members can insert activity" ON public.team_activity_log FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_above(auth.uid()) OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_activity_log.team_id AND tm.user_id = auth.uid()));

-- LMS, Sprints, Gates
DROP POLICY IF EXISTS "Same org can view sprints" ON public.sprints;
CREATE POLICY "Same org can view sprints" ON public.sprints FOR SELECT TO authenticated USING (org_id = get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage sprints" ON public.sprints;
CREATE POLICY "Admins can manage sprints" ON public.sprints FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()) AND org_id = get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Same org can view gates" ON public.gates;
CREATE POLICY "Same org can view gates" ON public.gates FOR SELECT TO authenticated USING (org_id = get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage gates" ON public.gates;
CREATE POLICY "Admins can manage gates" ON public.gates FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()) AND org_id = get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Same org can view lms_modules" ON public.lms_modules;
CREATE POLICY "Same org can view lms_modules" ON public.lms_modules FOR SELECT TO authenticated USING (org_id = get_user_org_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage lms_modules" ON public.lms_modules;
CREATE POLICY "Admins can manage lms_modules" ON public.lms_modules FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()) AND org_id = get_user_org_id(auth.uid()));

-- INVESTOR & MISC
DROP POLICY IF EXISTS "Investors can manage own watchlist" ON public.investor_watchlist;
CREATE POLICY "Investors can manage own watchlist" ON public.investor_watchlist FOR ALL TO authenticated USING (investor_id = auth.uid());
DROP POLICY IF EXISTS "Investors can manage own messages" ON public.investor_messages;
CREATE POLICY "Investors can manage own messages" ON public.investor_messages FOR ALL TO authenticated USING (investor_id = auth.uid());
DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Mentors can view own honorariums" ON public.honorariums;
CREATE POLICY "Mentors can view own honorariums" ON public.honorariums FOR SELECT TO authenticated USING (mentor_id = auth.uid());

-- ============================================================
-- 12. STORAGE
-- ============================================================

-- Avatars Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Submissions Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Team members can upload to own team folder" ON storage.objects;
CREATE POLICY "Team members can upload to own team folder" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'submissions' AND EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid() AND (storage.foldername(name))[1] = tm.team_id::text));
DROP POLICY IF EXISTS "Team members can view own team submissions storage" ON storage.objects;
CREATE POLICY "Team members can view own team submissions storage" ON storage.objects FOR SELECT USING (bucket_id = 'submissions' AND EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid() AND (storage.foldername(name))[1] = tm.team_id::text));
DROP POLICY IF EXISTS "Mentors can view assigned team submissions storage" ON storage.objects;
CREATE POLICY "Mentors can view assigned team submissions storage" ON storage.objects FOR SELECT USING (bucket_id = 'submissions' AND EXISTS (SELECT 1 FROM public.mentor_assignments ma WHERE ma.mentor_id = auth.uid() AND (storage.foldername(name))[1] = ma.team_id::text));
DROP POLICY IF EXISTS "Admins can view all submissions storage" ON storage.objects;
CREATE POLICY "Admins can view all submissions storage" ON storage.objects FOR SELECT USING (bucket_id = 'submissions' AND public.is_admin_or_above(auth.uid()));

-- ============================================================
-- 13. SPECIALIZED VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on)
AS
SELECT
  id, user_id, full_name, email, photo_url, bio, website,
  org_id, status, profile_completed, disc_completed,
  individual_credits, created_at, updated_at
FROM public.profiles;

-- ============================================================
-- 14. INVITATION TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.registration_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'team_member',
  org_id UUID REFERENCES public.organizations(id),
  org_name TEXT, -- Fallback name
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.registration_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage registration tokens" ON public.registration_tokens;
CREATE POLICY "Admins can manage registration tokens" ON public.registration_tokens FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid()));
DROP POLICY IF EXISTS "Public can check token validity" ON public.registration_tokens;
CREATE POLICY "Public can check token validity" ON public.registration_tokens FOR SELECT TO anon, authenticated USING (used_at IS NULL AND (expires_at IS NULL OR expires_at > now()));

-- ============================================================
-- 15. REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
