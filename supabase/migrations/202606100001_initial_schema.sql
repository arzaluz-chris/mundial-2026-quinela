create extension if not exists "pgcrypto";

create type public.match_status as enum ('scheduled', 'live', 'finished');
create type public.user_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  home_score integer,
  away_score integer,
  status public.match_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  constraint scores_are_non_negative check (
    (home_score is null or home_score >= 0) and
    (away_score is null or away_score >= 0)
  ),
  constraint finished_matches_have_scores check (
    status <> 'finished' or (home_score is not null and away_score is not null)
  )
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  predicted_home_score integer not null check (predicted_home_score >= 0),
  predicted_away_score integer not null check (predicted_away_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table public.leaderboard (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_points integer not null default 0,
  exact_predictions integer not null default 0,
  updated_at timestamptz not null default now()
);

create index matches_kickoff_at_idx on public.matches(kickoff_at);
create index predictions_match_id_idx on public.predictions(match_id);
create index predictions_user_id_idx on public.predictions(user_id);
create index leaderboard_sort_idx on public.leaderboard(total_points desc, exact_predictions desc);

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.leaderboard enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'display_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name);

  insert into public.leaderboard (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger predictions_touch_updated_at
before update on public.predictions
for each row execute function public.touch_updated_at();

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only admins can change profile roles.';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

create or replace function public.match_has_not_started(match_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches
    where id = match_uuid
      and kickoff_at > now()
  );
$$;

create or replace function public.prevent_locked_prediction_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starts_at timestamptz;
begin
  select kickoff_at into starts_at
  from public.matches
  where id = coalesce(new.match_id, old.match_id);

  if starts_at <= now() then
    raise exception 'Predictions are locked after kickoff.';
  end if;

  return new;
end;
$$;

create trigger predictions_lock_before_insert
before insert on public.predictions
for each row execute function public.prevent_locked_prediction_changes();

create trigger predictions_lock_before_update
before update on public.predictions
for each row execute function public.prevent_locked_prediction_changes();

create or replace function public.prediction_points(
  predicted_home integer,
  predicted_away integer,
  actual_home integer,
  actual_away integer
)
returns table(points integer, exact boolean)
language sql
immutable
as $$
  select
    case
      when predicted_home = actual_home and predicted_away = actual_away then 5
      when sign(predicted_home - predicted_away) = sign(actual_home - actual_away)
        and (predicted_home - predicted_away) = (actual_home - actual_away) then 3
      when sign(predicted_home - predicted_away) = sign(actual_home - actual_away) then 1
      else 0
    end as points,
    predicted_home = actual_home and predicted_away = actual_away as exact;
$$;

create or replace function public.recalculate_leaderboard()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can recalculate leaderboard.';
  end if;

  insert into public.leaderboard (user_id, total_points, exact_predictions, updated_at)
  select
    p.id,
    coalesce(sum(sc.points), 0)::integer as total_points,
    coalesce(count(*) filter (where sc.exact), 0)::integer as exact_predictions,
    now()
  from public.profiles p
  left join public.predictions pr on pr.user_id = p.id
  left join public.matches m
    on m.id = pr.match_id
   and m.status = 'finished'
   and m.home_score is not null
   and m.away_score is not null
  left join lateral public.prediction_points(
    pr.predicted_home_score,
    pr.predicted_away_score,
    m.home_score,
    m.away_score
  ) sc on m.id is not null
  group by p.id
  on conflict (user_id) do update
    set total_points = excluded.total_points,
        exact_predictions = excluded.exact_predictions,
        updated_at = excluded.updated_at;
end;
$$;

create policy "Profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Matches are readable by authenticated users"
on public.matches for select
to authenticated
using (true);

create policy "Admins can insert matches"
on public.matches for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update matches"
on public.matches for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete matches"
on public.matches for delete
to authenticated
using (public.is_admin());

create policy "Predictions visible by owner before kickoff and all after kickoff"
on public.predictions for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.matches m
    where m.id = match_id
      and m.kickoff_at <= now()
  )
);

create policy "Users can insert their own unlocked predictions"
on public.predictions for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.match_has_not_started(match_id)
);

create policy "Users can update their own unlocked predictions"
on public.predictions for update
to authenticated
using (
  user_id = auth.uid()
  and public.match_has_not_started(match_id)
)
with check (
  user_id = auth.uid()
  and public.match_has_not_started(match_id)
);

create policy "Leaderboard is readable by authenticated users"
on public.leaderboard for select
to authenticated
using (true);

grant execute on function public.recalculate_leaderboard() to authenticated;
