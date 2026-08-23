-- migration_add_user_ownership.sql
--
-- Run this in Supabase SQL Editor.
-- Adds user_id to the tables that need per-user ownership.
-- Nullable at first so existing rows don't break; we backfill after.

alter table public.conversations
  add column if not exists user_id uuid references auth.users(id);

alter table public.conversation_summaries
  add column if not exists user_id uuid references auth.users(id);

alter table public.messages
  add column if not exists user_id uuid references auth.users(id);

-- Index for fast per-user lookups
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversation_summaries_user_id on public.conversation_summaries(user_id);
create index if not exists idx_messages_user_id on public.messages(user_id);
