-- Create a table for user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  target_role TEXT,
  experience_level TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  experience JSONB,
  skills TEXT[],
  onboarded BOOLEAN DEFAULT FALSE,
  whatsapp_number TEXT,
  whatsapp_alerts BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create a table for CV analyses
CREATE TABLE cv_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  cv_text TEXT,
  score INTEGER,
  readiness_score INTEGER,
  sections JSONB, -- impact, presentation, keywords
  strengths TEXT[],
  improvements TEXT[],
  skill_gaps TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create a table for Career Roadmaps
CREATE TABLE career_roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  objective TEXT,
  summary TEXT,
  milestones JSONB, -- list of milestones
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile." ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own CV analyses." ON cv_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CV analyses." ON cv_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own roadmaps." ON career_roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own roadmaps." ON career_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Link profiles to auth.users automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
