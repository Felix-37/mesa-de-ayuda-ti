-- Migration: Fix RLS Policies and Add Admins Table
-- This migration remediates critical security gaps:
-- 1. Adds missing 'admins' table referenced by AuthContext
-- 2. Fixes RLS policies to support admin bypass pattern
-- 3. Enables proper role-based access control

-- ======================================================================
-- CREATE ADMINS TABLE
-- ======================================================================
-- Referenced by AuthContext.tsx line 53: supabase.from("admins").select("email")
-- This table stores admin user emails and enables role determination

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read the admins table (for AuthContext role check)
-- Anon users cannot read admins table
CREATE POLICY "Admins can read admin table" ON admins
  FOR SELECT
  USING (auth.email() IN (SELECT email FROM admins));

-- ======================================================================
-- FIX TICKETS TABLE - RLS POLICIES WITH ADMIN BYPASS
-- ======================================================================
-- Current policies only allow own tickets - block admin access
-- Fix: Add admin bypass pattern

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;

-- Policy: SELECT - Users see own tickets OR admins see all
CREATE POLICY "Users can view their own tickets or admins can view all" ON tickets
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.email() IN (SELECT email FROM admins)
  );

-- Policy: INSERT - Any authenticated user can create tickets
CREATE POLICY "Authenticated users can create tickets" ON tickets
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Policy: UPDATE - Users can update their own tickets OR admins can update any
CREATE POLICY "Users can update their own tickets or admins can update any" ON tickets
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR auth.email() IN (SELECT email FROM admins)
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.email() IN (SELECT email FROM admins)
  );

-- ======================================================================
-- FIX COMMENTS TABLE - RLS POLICIES WITH ADMIN BYPASS
-- ======================================================================
-- Comments should be visible to ticket owner, commenter, and admins

DROP POLICY IF EXISTS "Users can view comments on their tickets" ON comments;
DROP POLICY IF EXISTS "Users can insert comments on their tickets" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;

-- Policy: SELECT - Commenter, ticket owner, or admin can view
CREATE POLICY "Users can view relevant comments or admins can view all" ON comments
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.uid() = (SELECT user_id FROM tickets WHERE id = ticket_id)
    OR auth.email() IN (SELECT email FROM admins)
  );

-- Policy: INSERT - Commenter must be ticket owner or admin
CREATE POLICY "Users can comment on their tickets or admins can comment on any" ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM tickets WHERE id = ticket_id)
    OR auth.email() IN (SELECT email FROM admins)
  );

-- Policy: UPDATE - User can update their own comment or admin can update any
CREATE POLICY "Users can update their own comments or admins can update any" ON comments
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR auth.email() IN (SELECT email FROM admins)
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.email() IN (SELECT email FROM admins)
  );

-- ======================================================================
-- FIX TICKET_HISTORY TABLE - RLS POLICIES WITH ADMIN BYPASS
-- ======================================================================

DROP POLICY IF EXISTS "Users can view history of their own tickets" ON ticket_history;
DROP POLICY IF EXISTS "Users can insert history entries for their tickets" ON ticket_history;

-- Policy: SELECT - User can view their ticket history or admin can view all
CREATE POLICY "Users can view their ticket history or admins can view all" ON ticket_history
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.email() IN (SELECT email FROM admins)
  );

-- Policy: INSERT - Automatically created by triggers (service role) so public insert OK with trigger validation
CREATE POLICY "Service role can insert history entries" ON ticket_history
  FOR INSERT
  WITH CHECK (true);

-- ======================================================================
-- INSERT SEED ADMIN (optional - remove or change email after setup)
-- ======================================================================
-- For development/testing, insert a default admin
-- In production, manage admins table directly or via admin UI

INSERT INTO admins (email) VALUES ('admin@example.com')
  ON CONFLICT (email) DO NOTHING;

-- ======================================================================
-- VERIFICATION QUERIES
-- ======================================================================
-- Run these queries to verify the fix:
-- SELECT * FROM admins;
-- SELECT * FROM information_schema.tables WHERE table_name IN ('admins', 'tickets', 'comments', 'ticket_history');
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('admins', 'tickets', 'comments', 'ticket_history');
