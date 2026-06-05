-- DROP EXISTING NEW TABLES (If re-running)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.settlements CASCADE;
DROP TABLE IF EXISTS public.expense_participants CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- DROP EXISTING OLD TABLES (Legacy)
DROP TABLE IF EXISTS public.expense_splits CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;

-- ============================================================
-- Migration 001: Extensions & Utility Functions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Migration 002: Profiles Table + Auth Trigger
-- ============================================================

CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email         TEXT NOT NULL UNIQUE,
    full_name     TEXT,
    display_name  TEXT,
    avatar_url    TEXT,
    phone         TEXT,
    currency      TEXT NOT NULL DEFAULT 'INR',
    timezone      TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX idx_profiles_email_trgm ON public.profiles USING gin (email gin_trgm_ops);
CREATE INDEX idx_profiles_display_name_trgm ON public.profiles USING gin (display_name gin_trgm_ops);

-- ============================================================
-- Migration 003: Categories Table + Seed Data
-- ============================================================

CREATE TABLE public.categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    icon        TEXT,
    color       TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT false,
    created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT categories_system_or_user CHECK (
        (is_system = true AND created_by IS NULL) OR
        (is_system = false AND created_by IS NOT NULL)
    )
);

CREATE UNIQUE INDEX idx_categories_system_slug ON public.categories (slug) WHERE is_system = true;
CREATE UNIQUE INDEX idx_categories_user_slug ON public.categories (created_by, slug) WHERE is_system = false;

INSERT INTO public.categories (name, slug, icon, color, is_system) VALUES
    ('Food & Drinks',     'food',          'UtensilsCrossed', '#FF6B6B', true),
    ('Transport',         'transport',     'Car',             '#4ECDC4', true),
    ('Shopping',          'shopping',      'ShoppingBag',     '#45B7D1', true),
    ('Entertainment',     'entertainment', 'Film',            '#96CEB4', true),
    ('Bills & Utilities', 'bills',         'Zap',             '#FFEAA7', true),
    ('Rent',              'rent',          'Home',            '#DDA0DD', true),
    ('Health',            'health',        'Heart',           '#FF6348', true),
    ('Education',         'education',     'GraduationCap',   '#7B68EE', true),
    ('Travel',            'travel',        'Plane',           '#00CEC9', true),
    ('Subscriptions',     'subscriptions', 'CreditCard',      '#FD79A8', true),
    ('Other',             'other',         'MoreHorizontal',  '#636E72', true);

-- ============================================================
-- Migration 004: Friendships Table
-- ============================================================

CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');

CREATE TABLE public.friendships (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    addressee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status        public.friendship_status NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT friendships_no_self CHECK (requester_id != addressee_id)
);

-- Note: Cannot use UNIQUE() directly with expressions in CREATE TABLE. Use UNIQUE INDEX instead:
CREATE UNIQUE INDEX friendships_unique_pair_idx ON public.friendships (
    LEAST(requester_id, addressee_id),
    GREATEST(requester_id, addressee_id)
);

CREATE TRIGGER friendships_updated_at
    BEFORE UPDATE ON public.friendships
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_friendships_requester ON public.friendships (requester_id, status);
CREATE INDEX idx_friendships_addressee ON public.friendships (addressee_id, status);
CREATE INDEX idx_friendships_status ON public.friendships (status);

-- ============================================================
-- Migration 005: Expenses Table
-- ============================================================

CREATE TYPE public.split_type AS ENUM ('equal', 'percentage', 'custom');

CREATE TABLE public.expenses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by   UUID NOT NULL REFERENCES public.profiles(id),
    group_id     UUID,  
    category_id  UUID NOT NULL REFERENCES public.categories(id),
    title        TEXT NOT NULL,
    description  TEXT,
    amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency     TEXT NOT NULL DEFAULT 'INR',
    date         DATE NOT NULL,
    split_type   public.split_type NOT NULL DEFAULT 'equal',
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurring_id UUID,  
    is_deleted   BOOLEAN NOT NULL DEFAULT false,
    deleted_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_expenses_created_by ON public.expenses (created_by) WHERE is_deleted = false;
CREATE INDEX idx_expenses_category ON public.expenses (category_id);
CREATE INDEX idx_expenses_date ON public.expenses (date DESC);
CREATE INDEX idx_expenses_date_user ON public.expenses (created_by, date DESC) WHERE is_deleted = false;

-- ============================================================
-- Migration 006: Expense Participants Table
-- ============================================================

CREATE TABLE public.expense_participants (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id    UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES public.profiles(id),
    amount_paid   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    amount_owed   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_owed >= 0),
    percentage    NUMERIC(5,2),  
    is_settled    BOOLEAN NOT NULL DEFAULT false,
    settled_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(expense_id, user_id)
);

CREATE TRIGGER expense_participants_updated_at
    BEFORE UPDATE ON public.expense_participants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_expense_participants_user ON public.expense_participants (user_id);
CREATE INDEX idx_expense_participants_expense ON public.expense_participants (expense_id);
CREATE INDEX idx_expense_participants_unsettled ON public.expense_participants (user_id) WHERE is_settled = false;

-- ============================================================
-- Migration 007: Settlements Table
-- ============================================================

CREATE TYPE public.settlement_status AS ENUM ('pending', 'confirmed', 'rejected');

CREATE TABLE public.settlements (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id      UUID NOT NULL REFERENCES public.profiles(id),
    payee_id      UUID NOT NULL REFERENCES public.profiles(id),
    group_id      UUID,  
    amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency      TEXT NOT NULL DEFAULT 'INR',
    status        public.settlement_status NOT NULL DEFAULT 'pending',
    note          TEXT,
    settled_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    confirmed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT settlements_no_self CHECK (payer_id != payee_id)
);

CREATE TRIGGER settlements_updated_at
    BEFORE UPDATE ON public.settlements
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_settlements_payer ON public.settlements (payer_id);
CREATE INDEX idx_settlements_payee ON public.settlements (payee_id);
CREATE INDEX idx_settlements_status ON public.settlements (status);

-- ============================================================
-- Migration 008: Notifications Table
-- ============================================================

CREATE TYPE public.notification_type AS ENUM (
    'friend_request_received',
    'friend_request_accepted',
    'expense_added',
    'expense_updated',
    'settlement_requested',
    'settlement_confirmed',
    'group_invitation',
    'group_expense_added',
    'payment_reminder',
    'monthly_report',
    'recurring_expense_generated',
    'system'
);

CREATE TABLE public.notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type            public.notification_type NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT,
    data            JSONB NOT NULL DEFAULT '{}',
    is_read         BOOLEAN NOT NULL DEFAULT false,
    read_at         TIMESTAMPTZ,
    action_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, created_at DESC)
    WHERE is_read = false;
CREATE INDEX idx_notifications_user_all ON public.notifications (user_id, created_at DESC);

-- ============================================================
-- Migration 009: Row Level Security Policies (Phase 1)
-- ============================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (is_system = true OR created_by = auth.uid());

CREATE POLICY "Users can create custom categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid() AND is_system = false);

CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    TO authenticated
    USING (created_by = auth.uid() AND is_system = false);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
    ON public.friendships FOR SELECT
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
    ON public.friendships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships"
    ON public.friendships FOR UPDATE
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can remove friendships"
    ON public.friendships FOR DELETE
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relevant expenses"
    ON public.expenses FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid()
        OR id IN (
            SELECT expense_id FROM public.expense_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create expenses"
    ON public.expenses FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can update expenses"
    ON public.expenses FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Creators can delete expenses"
    ON public.expenses FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relevant participants"
    ON public.expense_participants FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR expense_id IN (
            SELECT id FROM public.expenses WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Expense creators manage participants"
    ON public.expense_participants FOR INSERT
    TO authenticated
    WITH CHECK (
        expense_id IN (
            SELECT id FROM public.expenses WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Expense creators update participants"
    ON public.expense_participants FOR UPDATE
    TO authenticated
    USING (
        expense_id IN (
            SELECT id FROM public.expenses WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Expense creators delete participants"
    ON public.expense_participants FOR DELETE
    TO authenticated
    USING (
        expense_id IN (
            SELECT id FROM public.expenses WHERE created_by = auth.uid()
        )
    );

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settlements"
    ON public.settlements FOR SELECT
    TO authenticated
    USING (payer_id = auth.uid() OR payee_id = auth.uid());

CREATE POLICY "Users can create settlements"
    ON public.settlements FOR INSERT
    TO authenticated
    WITH CHECK (payer_id = auth.uid());

CREATE POLICY "Users can update own settlements"
    ON public.settlements FOR UPDATE
    TO authenticated
    USING (payee_id = auth.uid() OR payer_id = auth.uid());

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================
-- Migration 010: Database Views
-- ============================================================

CREATE OR REPLACE VIEW public.user_balances AS
WITH expense_debts AS (
    SELECT
        ep_debtor.user_id AS debtor_id,
        ep_creditor.user_id AS creditor_id,
        (ep_debtor.amount_owed - ep_debtor.amount_paid) AS debt_amount
    FROM public.expense_participants ep_debtor
    JOIN public.expenses e ON e.id = ep_debtor.expense_id
    JOIN public.expense_participants ep_creditor ON ep_creditor.expense_id = e.id
    WHERE e.is_deleted = false
      AND ep_debtor.amount_paid < ep_debtor.amount_owed
      AND ep_creditor.amount_paid > ep_creditor.amount_owed
      AND ep_debtor.user_id != ep_creditor.user_id
),
settlement_credits AS (
    SELECT payer_id, payee_id, SUM(amount) AS total_settled
    FROM public.settlements
    WHERE status = 'confirmed'
    GROUP BY payer_id, payee_id
),
net_debts AS (
    SELECT
        debtor_id,
        creditor_id,
        SUM(debt_amount) AS total_owed
    FROM expense_debts
    GROUP BY debtor_id, creditor_id
)
SELECT
    nd.debtor_id,
    nd.creditor_id,
    nd.total_owed
        - COALESCE(sc.total_settled, 0)
        + COALESCE(sc_reverse.total_settled, 0)
    AS net_balance
FROM net_debts nd
LEFT JOIN settlement_credits sc
    ON sc.payer_id = nd.debtor_id AND sc.payee_id = nd.creditor_id
LEFT JOIN settlement_credits sc_reverse
    ON sc_reverse.payer_id = nd.creditor_id AND sc_reverse.payee_id = nd.debtor_id
WHERE nd.total_owed - COALESCE(sc.total_settled, 0) + COALESCE(sc_reverse.total_settled, 0) > 0.01;

-- ============================================================
-- Migration 011: Database Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, title, body, data, action_url)
    VALUES (
        NEW.addressee_id,
        'friend_request_received',
        'New Friend Request',
        (SELECT COALESCE(display_name, full_name, email) FROM public.profiles WHERE id = NEW.requester_id) || ' wants to connect',
        jsonb_build_object('friendship_id', NEW.id, 'requester_id', NEW.requester_id),
        '/friends'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friend_request
    AFTER INSERT ON public.friendships
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION public.notify_friend_request();


CREATE OR REPLACE FUNCTION public.notify_friend_accepted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        INSERT INTO public.notifications (user_id, type, title, body, data, action_url)
        VALUES (
            NEW.requester_id,
            'friend_request_accepted',
            'Friend Request Accepted',
            (SELECT COALESCE(display_name, full_name, email) FROM public.profiles WHERE id = NEW.addressee_id) || ' accepted your request',
            jsonb_build_object('friendship_id', NEW.id, 'addressee_id', NEW.addressee_id),
            '/friends'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friend_accepted
    AFTER UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_friend_accepted();


CREATE OR REPLACE FUNCTION public.notify_settlement()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, title, body, data, action_url)
    VALUES (
        NEW.payee_id,
        'settlement_requested',
        'Settlement Received',
        (SELECT COALESCE(display_name, full_name, email) FROM public.profiles WHERE id = NEW.payer_id)
            || ' settled ₹' || NEW.amount::TEXT,
        jsonb_build_object('settlement_id', NEW.id, 'payer_id', NEW.payer_id, 'amount', NEW.amount),
        '/settlements'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_settlement_created
    AFTER INSERT ON public.settlements
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_settlement();
