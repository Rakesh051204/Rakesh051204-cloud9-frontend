-- 3_update_rls_policies.sql
--
-- Replaces the earlier "deny all anon" approach with real
-- per-user policies. Your backend still uses the service_role
-- key (which bypasses RLS entirely) for its own reads/writes —
-- these policies matter if you ever let the frontend talk to
-- Supabase directly in the future, and as defense-in-depth.

-- Drop the old blanket-deny policies (they did their job, now
-- we replace them with real ownership-based rules).
drop policy if exists "deny_all_anon" on public.conversations;
drop policy if exists "deny_all_anon" on public.conversation_summaries;
drop policy if exists "deny_all_anon" on public.messages;

-- CONVERSATIONS: users can only see their own rows
create policy "users_select_own_conversations"
on public.conversations
for select
to authenticated
using (auth.uid() = user_id);

create policy "users_insert_own_conversations"
on public.conversations
for insert
to authenticated
with check (auth.uid() = user_id);

-- CONVERSATION_SUMMARIES: same pattern
create policy "users_select_own_summaries"
on public.conversation_summaries
for select
to authenticated
using (auth.uid() = user_id);

create policy "users_insert_own_summaries"
on public.conversation_summaries
for insert
to authenticated
with check (auth.uid() = user_id);

-- MESSAGES: same pattern
create policy "users_select_own_messages"
on public.messages
for select
to authenticated
using (auth.uid() = user_id);

create policy "users_insert_own_messages"
on public.messages
for insert
to authenticated
with check (auth.uid() = user_id);

-- Keep anon fully blocked (nobody unauthenticated should read/write directly)
create policy "deny_anon_conversations"
on public.conversations
as restrictive
for all
to anon
using (false);

create policy "deny_anon_summaries"
on public.conversation_summaries
as restrictive
for all
to anon
using (false);

create policy "deny_anon_messages"
on public.messages
as restrictive
for all
to anon
using (false);
