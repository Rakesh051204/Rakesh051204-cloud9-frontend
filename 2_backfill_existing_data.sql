-- 2_backfill_existing_data.sql
--
-- Run this AFTER you've signed up for a real account in your app
-- (via Supabase Auth email/password signup).
--
-- Steps:
-- 1. Sign up in your app (or via Supabase dashboard: Authentication > Users > Add user)
-- 2. Go to Authentication > Users in Supabase dashboard, copy your new user's UUID
-- 3. Paste that UUID below, replacing 'YOUR-USER-UUID-HERE'
-- 4. Run this script

update public.conversations
set user_id = 'YOUR-USER-UUID-HERE'
where user_id is null;

update public.conversation_summaries
set user_id = 'YOUR-USER-UUID-HERE'
where user_id is null;

update public.messages
set user_id = 'YOUR-USER-UUID-HERE'
where user_id is null;

-- Verify it worked:
select count(*) as migrated_conversations from public.conversations where user_id is not null;
select count(*) as migrated_summaries from public.conversation_summaries where user_id is not null;
select count(*) as migrated_messages from public.messages where user_id is not null;
