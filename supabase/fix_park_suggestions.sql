-- Fix: "Foreslå park" feilet
-- Årsak: park_suggestions-tabellen manglet + parks blokkerte INSERT via RLS.
-- Idempotent — trygt å kjøre flere ganger.

-- 1) Opprett park_suggestions-tabellen (logg over foreslåtte parker)
create table if not exists public.park_suggestions (
  id           uuid primary key default gen_random_uuid(),
  submitter_id uuid references auth.users(id) on delete set null,
  name         text not null,
  description  text,
  address      text,
  city         text,
  lat          double precision,
  lng          double precision,
  fenced       boolean default false,
  status       text default 'pending',
  created_at   timestamptz default now()
);

alter table public.park_suggestions enable row level security;

-- Innloggede brukere kan legge inn EGNE forslag
drop policy if exists "insert_own_suggestions" on public.park_suggestions;
create policy "insert_own_suggestions"
  on public.park_suggestions for insert to authenticated
  with check (submitter_id = auth.uid());

-- ...og se sine egne forslag
drop policy if exists "select_own_suggestions" on public.park_suggestions;
create policy "select_own_suggestions"
  on public.park_suggestions for select to authenticated
  using (submitter_id = auth.uid());

-- 2) La innloggede brukere legge inn nye parker som "pending"
--    (status = 'pending' -> vises med gult merke, godkjennes etter 3 innsjekk)
drop policy if exists "insert_pending_parks" on public.parks;
create policy "insert_pending_parks"
  on public.parks for insert to authenticated
  with check (status = 'pending');

-- Be PostgREST laste skjemaet på nytt så den nye tabellen blir synlig med en gang
notify pgrst, 'reload schema';
