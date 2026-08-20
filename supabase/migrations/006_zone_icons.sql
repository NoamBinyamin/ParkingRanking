-- Swaps in better-fitting icons for a couple of zones. Run once in the
-- Supabase SQL editor.

update public.zones set icon = '🍕' where slug = 'katznelson-a'; -- description calls out pizza
update public.zones set icon = '🌃' where slug = 'sirkin-b';    -- "great spot to close out for the night"
