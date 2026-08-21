-- Recolors zones to match the reference street-map artwork's own highlight
-- scheme: joker gets its own pink/coral, both "a" zones share the map's
-- orange highlight and both "b" zones share its green highlight (same two
-- streets on the map, split by letter). Sachla has no street of its own on
-- the map, so its color is untouched. Run once in the Supabase SQL editor.

update public.zones set color = '#f07878' where slug = 'joker';
update public.zones set color = '#f0b090' where slug in ('sirkin-a', 'katznelson-a');
update public.zones set color = '#80c8a8' where slug in ('sirkin-b', 'katznelson-b');
