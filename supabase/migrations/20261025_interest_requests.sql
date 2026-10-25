-- Apply once in the SQL Editor for this project's Supabase database.
-- Public visitors can submit through the RPC only; they cannot read leads.
begin;

create table if not exists public.interest_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text not null check (phone ~ '^\+9665[0-9]{8}$'),
  interest text not null check (interest in ('شراء وحدة سكنية', 'تسويق عقار', 'إدارة الأملاك', 'استفسار آخر')),
  message text not null default '' check (char_length(message) <= 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'follow_up', 'closed')),
  admin_notes text not null default '' check (char_length(admin_notes) <= 2000),
  contact_consent boolean not null check (contact_consent = true),
  consent_version text not null default 'interest-v1',
  consented_at timestamptz not null default now(),
  source text not null default 'website' check (source = 'website')
);

create index if not exists interest_requests_created_idx on public.interest_requests (created_at desc);
create index if not exists interest_requests_phone_created_idx on public.interest_requests (phone, created_at desc);
alter table public.interest_requests enable row level security;
revoke all on public.interest_requests from anon, authenticated;
grant select on public.interest_requests to authenticated;
grant update (status, admin_notes) on public.interest_requests to authenticated;

drop policy if exists "Interest admin read" on public.interest_requests;
create policy "Interest admin read" on public.interest_requests for select to authenticated
using ((select auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com');
drop policy if exists "Interest admin update" on public.interest_requests;
create policy "Interest admin update" on public.interest_requests for update to authenticated
using ((select auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com');

create or replace function public.register_interest(
  p_full_name text, p_phone text, p_interest text,
  p_message text default '', p_consent boolean default false, p_website text default ''
) returns void language plpgsql security definer set search_path = '' as $$
declare
  v_name text := btrim(coalesce(p_full_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[[:space:]()-]', '', 'g');
  v_message text := btrim(coalesce(p_message, ''));
begin
  -- Honeypot: accept silently, without creating a record.
  if btrim(coalesce(p_website, '')) <> '' then return; end if;
  if v_phone ~ '^05[0-9]{8}$' then v_phone := '+966' || substr(v_phone, 2); end if;
  if v_phone ~ '^9665[0-9]{8}$' then v_phone := '+' || v_phone; end if;
  if v_phone ~ '^009665[0-9]{8}$' then v_phone := '+' || substr(v_phone, 3); end if;
  if char_length(v_name) not between 2 and 100
     or v_phone !~ '^\+9665[0-9]{8}$'
     or p_interest is null or p_interest not in ('شراء وحدة سكنية', 'تسويق عقار', 'إدارة الأملاك', 'استفسار آخر')
     or char_length(v_message) > 1000 or p_consent is distinct from true then
    raise exception 'Invalid interest request' using errcode = '22023';
  end if;
  -- Serialize submissions for the same phone; avoid duplicate records on retries.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_phone, 0));
  if exists (select 1 from public.interest_requests where phone = v_phone and created_at > now() - interval '10 minutes') then return; end if;
  insert into public.interest_requests (full_name, phone, interest, message, contact_consent, consent_version)
  values (v_name, v_phone, p_interest, v_message, true, 'interest-v1');
end;
$$;
revoke all on function public.register_interest(text, text, text, text, boolean, text) from public;
grant execute on function public.register_interest(text, text, text, text, boolean, text) to anon, authenticated;
comment on table public.interest_requests is 'Private customer interest requests. Read/update restricted to the existing project admin.';
commit;
