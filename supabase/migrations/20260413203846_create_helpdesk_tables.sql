-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id BIGSERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Nuevo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    attachment_url TEXT
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID NOT NULL
);

-- Create ticket_history table
CREATE TABLE IF NOT EXISTS public.ticket_history (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON public.tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at);

CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON public.comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id ON public.ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_changed_at ON public.ticket_history(changed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tickets
CREATE POLICY "Users can view their own tickets" ON public.tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets" ON public.tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON public.tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for comments
CREATE POLICY "Users can view comments on their tickets" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tickets
            WHERE tickets.id = comments.ticket_id
            AND tickets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert comments on their tickets" ON public.comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tickets
            WHERE tickets.id = comments.ticket_id
            AND tickets.user_id = auth.uid()
        )
    );

-- Create RLS policies for ticket_history
CREATE POLICY "Users can view history of their tickets" ON public.ticket_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tickets
            WHERE tickets.id = ticket_history.ticket_id
            AND tickets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert history for their tickets" ON public.ticket_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tickets
            WHERE tickets.id = ticket_history.ticket_id
            AND tickets.user_id = auth.uid()
        )
    );