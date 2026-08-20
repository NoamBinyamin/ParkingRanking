-- Migration for a project that already ran the original schema.sql.
-- Adds the "description" column and replaces the zone list with the new
-- Hebrew zones. Run this once in the Supabase SQL editor.

alter table public.zones add column if not exists description text not null default '';

-- Wipe existing test reports and zones so the old (English) zones don't
-- linger alongside the new ones. Safe to run even if both tables are
-- already empty.
delete from public.reports;
delete from public.zones;

insert into public.zones (name, slug, point_value, color, icon, description) values
  ('ג''וקר', 'joker', 50, '#ff5da2', '🃏',
    'הקלף המנצח! מצאת את החניה המושלמת שכולם חולמים עליה. שיחקת אותה בענק! 🃏👑'),
  ('כצנלסון א''', 'katznelson-a', 20, '#7c5cff', '🏙️',
    'חניה של אלופים. 🏙️🍕'),
  ('סירקין א''', 'sirkin-a', 20, '#33d17a', '🌳',
    'חניה מעולה בחלק המבוקש סירקין. אפשר לכבות מנוע ברוגע. 🌳🚙'),
  ('כצנלסון ב''', 'katznelson-b', 10, '#3ec6ff', '🚶',
    'קצת יותר הליכה על כצנלסון, אבל היי - חניה זו חניה! 🚶‍♂️🛍️'),
  ('סירקין ב''', 'sirkin-b', 10, '#ffc93c', '🌙',
    'בהמשך הרחוב של סירקין. לא מושלם, אבל סוגר פינה מעולה ללילה. 🌙🚗'),
  ('סחלה', 'sachla', -20, '#ff5a5f', '💩',
    'על הפנים... חניה נוראית, רחוקה, צפופה או סתם מייאשת. עדיף היה לבוא באופניים. 💩👎');

-- Also reset scores to 0 for anyone who had points from the old zones.
update public.profiles set total_score = 0;
