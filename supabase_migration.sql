-- ============================================
-- KitchenGuard Database Migration Script
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);

-- ============================================
-- 2. ALERTS TABLE
-- ============================================

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  type TEXT NOT NULL CHECK (type IN ('gas_leak', 'co_detection', 'temperature', 'child_detected', 'system', 'other')),
  metadata JSONB DEFAULT '{}'::jsonb,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can insert their own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can update their own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can delete their own alerts" ON public.alerts;

-- Create policies
CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS alerts_user_id_idx ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS alerts_created_at_idx ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS alerts_severity_idx ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS alerts_dismissed_idx ON public.alerts(dismissed);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for alerts
DROP TRIGGER IF EXISTS update_alerts_updated_at ON public.alerts;
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. FAMILY MEMBERS TABLE
-- ============================================

-- Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, email)
);

-- Enable Row Level Security
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can insert their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can update their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can delete their own family members" ON public.family_members;

-- Create policies
CREATE POLICY "Users can view their own family members"
  ON public.family_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family members"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members"
  ON public.family_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members"
  ON public.family_members FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS family_members_user_id_idx ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS family_members_email_idx ON public.family_members(email);
CREATE INDEX IF NOT EXISTS family_members_created_at_idx ON public.family_members(created_at DESC);

-- Create trigger for family_members
DROP TRIGGER IF EXISTS update_family_members_updated_at ON public.family_members;
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. DEVICE METRICS TABLE (Optional)
-- ============================================

-- Create device_metrics table for storing sensor history
CREATE TABLE IF NOT EXISTS public.device_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  co_level NUMERIC(5,2),
  gas_level NUMERIC(5,2),
  temperature NUMERIC(5,2),
  fire_sensor NUMERIC(5,2),
  valve_open BOOLEAN DEFAULT true,
  fan_on BOOLEAN DEFAULT false,
  child_detected BOOLEAN DEFAULT false,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.device_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.device_metrics;
DROP POLICY IF EXISTS "Users can insert their own metrics" ON public.device_metrics;

-- Create policies
CREATE POLICY "Users can view their own metrics"
  ON public.device_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON public.device_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS device_metrics_user_id_idx ON public.device_metrics(user_id);
CREATE INDEX IF NOT EXISTS device_metrics_recorded_at_idx ON public.device_metrics(recorded_at DESC);

-- ============================================
-- 5. ENABLE REAL-TIME SUBSCRIPTIONS
-- ============================================

-- Enable real-time for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Enable real-time for family_members
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_members;

-- Enable real-time for profiles (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable real-time for device_metrics (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_metrics;

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Check all tables exist
SELECT 'Tables Created:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'alerts', 'family_members', 'device_metrics')
ORDER BY table_name;

-- Check RLS is enabled
SELECT 'RLS Status:' as status;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'alerts', 'family_members', 'device_metrics')
ORDER BY tablename;

-- Check real-time publication
SELECT 'Real-time Tables:' as status;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('profiles', 'alerts', 'family_members', 'device_metrics')
ORDER BY tablename;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All tables, policies, and real-time subscriptions are now set up!
-- Your KitchenGuard application is ready to use the database.
-- ============================================
