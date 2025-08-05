-- Trigger to automatically create a profile when a user signs up
-- This ensures every authenticated user has a corresponding profile

-- Create or replace the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  -- Get email from auth.users
  user_email := NEW.email;
  
  -- Get full_name from user metadata if available
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- Insert profile for new user
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    university,
    bio,
    profile_image,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_email,
    user_full_name,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Enable RLS (Row Level Security) on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public read access for demo purposes (can be restricted later)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Update the profiles table to include additional fields for comprehensive user management
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS institution TEXT,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sports JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_university ON public.profiles(university);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution);

-- Create a function to get user profile with safe access
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  university TEXT,
  institution TEXT,
  bio TEXT,
  profile_image TEXT,
  phone TEXT,
  gender TEXT,
  age INTEGER,
  date_of_birth DATE,
  nationality TEXT,
  occupation TEXT,
  location TEXT,
  visibility_settings JSONB,
  sports JSONB,
  achievements JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.university,
    p.institution,
    p.bio,
    p.profile_image,
    p.phone,
    p.gender,
    p.age,
    p.date_of_birth,
    p.nationality,
    p.occupation,
    p.location,
    p.visibility_settings,
    p.sports,
    p.achievements,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO anon, authenticated;

-- Create a function to update user profile safely
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_university TEXT DEFAULT NULL,
  p_institution TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_profile_image TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_age INTEGER DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_nationality TEXT DEFAULT NULL,
  p_occupation TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_visibility_settings JSONB DEFAULT NULL,
  p_sports JSONB DEFAULT NULL,
  p_achievements JSONB DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
  result public.profiles;
BEGIN
  -- Check if user is updating their own profile
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'You can only update your own profile';
  END IF;

  UPDATE public.profiles
  SET
    full_name = COALESCE(p_full_name, full_name),
    university = COALESCE(p_university, university),
    institution = COALESCE(p_institution, institution),
    bio = COALESCE(p_bio, bio),
    profile_image = COALESCE(p_profile_image, profile_image),
    phone = COALESCE(p_phone, phone),
    gender = COALESCE(p_gender, gender),
    age = COALESCE(p_age, age),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    nationality = COALESCE(p_nationality, nationality),
    occupation = COALESCE(p_occupation, occupation),
    location = COALESCE(p_location, location),
    visibility_settings = COALESCE(p_visibility_settings, visibility_settings),
    sports = COALESCE(p_sports, sports),
    achievements = COALESCE(p_achievements, achievements),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the update function
GRANT EXECUTE ON FUNCTION update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB) TO authenticated;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user is created in auth.users';
COMMENT ON FUNCTION get_user_profile(UUID) IS 'Safely retrieves a user profile by ID';
COMMENT ON FUNCTION update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB) IS 'Safely updates a user profile with validation';
