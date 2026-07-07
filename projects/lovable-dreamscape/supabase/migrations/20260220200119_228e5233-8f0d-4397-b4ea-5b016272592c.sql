
-- ============================================
-- WHITE TIGER STUDIOS — GAMIFIED LMS SCHEMA
-- ============================================

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_stage INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Tiger Student'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pipeline stages (the 8 "worlds")
CREATE TABLE public.pipeline_stages (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_es TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  order_index INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stages" ON public.pipeline_stages FOR SELECT USING (true);

-- Lessons within each stage
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id INTEGER REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_es TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  lesson_type TEXT NOT NULL DEFAULT 'text' CHECK (lesson_type IN ('text', 'quiz', 'roleplay', 'challenge')),
  order_index INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 25,
  is_free BOOLEAN NOT NULL DEFAULT false,
  character_guide TEXT DEFAULT 'tiger-professor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(stage_id, slug)
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view free lessons" ON public.lessons FOR SELECT USING (is_free = true);
CREATE POLICY "Authenticated can view all lessons" ON public.lessons FOR SELECT TO authenticated USING (true);

-- Quiz questions for lessons
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  question_es TEXT NOT NULL,
  question_en TEXT NOT NULL,
  options_es JSONB NOT NULL DEFAULT '[]',
  options_en JSONB NOT NULL DEFAULT '[]',
  correct_index INTEGER NOT NULL DEFAULT 0,
  explanation_es TEXT DEFAULT '',
  explanation_en TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 10
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);

-- Role-play scenarios
CREATE TABLE public.roleplay_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  scenario_es TEXT NOT NULL,
  scenario_en TEXT NOT NULL,
  role_title_es TEXT NOT NULL DEFAULT '',
  role_title_en TEXT NOT NULL DEFAULT '',
  choices JSONB NOT NULL DEFAULT '[]',
  outcome_xp INTEGER NOT NULL DEFAULT 30,
  order_index INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.roleplay_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view scenarios" ON public.roleplay_scenarios FOR SELECT USING (true);

-- User progress tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Achievements / badges
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_es TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🏆',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  condition_type TEXT NOT NULL DEFAULT 'stage_complete',
  condition_value TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User earned achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
