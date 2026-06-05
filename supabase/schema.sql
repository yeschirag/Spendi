-- Spendi Robust Database Schema

-- DROP EXISTING TABLES
-- This ensures a clean slate before creating the new schema
DROP TABLE IF EXISTS public.expense_splits CASCADE;
DROP TABLE IF EXISTS public.settlements CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. PROFILES
-- Link to Supabase Auth to store user details
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.profiles TO anon, authenticated;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);


-- 2. FRIENDS
-- Supports both local "dummy" friends and real app users
CREATE TABLE public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    friend_user_id UUID REFERENCES public.profiles(id), -- Nullable for local friends
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

GRANT ALL ON TABLE public.friends TO anon, authenticated;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friends list"
    ON public.friends FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add friends"
    ON public.friends FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friends"
    ON public.friends FOR DELETE
    USING (auth.uid() = user_id);


-- 3. EXPENSES
-- Core expense record
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.expenses TO anon, authenticated;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses they created"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id);


-- 4. EXPENSE SPLITS
-- Maps who owes what for an expense
CREATE TABLE public.expense_splits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL, -- The person who created the split
    friend_name TEXT NOT NULL, -- Who owes the money (or 'You')
    friend_user_id UUID REFERENCES public.profiles(id), -- If they are an app user
    amount_owed NUMERIC NOT NULL,
    amount_paid NUMERIC DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.expense_splits TO anon, authenticated;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own splits"
    ON public.expense_splits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own splits"
    ON public.expense_splits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own splits"
    ON public.expense_splits FOR DELETE
    USING (auth.uid() = user_id);


-- 5. SETTLEMENTS
-- Tracks direct payments between people
CREATE TABLE public.settlements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL, -- Person recording the settlement
    payer_name TEXT NOT NULL,
    payee_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.settlements TO anon, authenticated;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settlements"
    ON public.settlements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settlements"
    ON public.settlements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settlements"
    ON public.settlements FOR DELETE
    USING (auth.uid() = user_id);


