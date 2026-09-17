-- Keepalive: én rad som keepalive-roboten oppdaterer hver 3. dag.
-- Supabase ser da ekte SKRIVE-aktivitet (lese-ping teller ikke lenger)
-- og pauser derfor ikke prosjektet. Idempotent — trygg å kjøre flere ganger.

create table if not exists public.keepalive (
  id        int primary key default 1,
  last_ping timestamptz default now(),
  constraint keepalive_single_row check (id = 1)
);

insert into public.keepalive (id, last_ping)
  values (1, now())
  on conflict (id) do nothing;

alter table public.keepalive enable row level security;

-- La app-nøkkelen (anon) oppdatere den ene raden — kun timestamp, ingen skade
drop policy if exists "anon_update_keepalive" on public.keepalive;
create policy "anon_update_keepalive"
  on public.keepalive for update to anon
  using (id = 1) with check (id = 1);

notify pgrst, 'reload schema';
