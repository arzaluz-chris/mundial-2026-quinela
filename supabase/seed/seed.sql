insert into public.matches (home_team, away_team, kickoff_at, status)
values
  ('Mexico', 'Sudafrica', '2026-06-11 19:00:00+00', 'scheduled'),
  ('Canada', 'Japon', '2026-06-12 00:00:00+00', 'scheduled'),
  ('Estados Unidos', 'Ghana', '2026-06-12 21:00:00+00', 'scheduled'),
  ('Argentina', 'Marruecos', '2026-06-13 18:00:00+00', 'scheduled'),
  ('Brasil', 'Croacia', '2026-06-13 23:00:00+00', 'scheduled'),
  ('Espana', 'Corea del Sur', '2026-06-14 20:00:00+00', 'scheduled')
on conflict do nothing;
