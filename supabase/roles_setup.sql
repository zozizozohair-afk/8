begin;
create table public.user_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('owner','manager','staff')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.user_roles enable row level security;
revoke all on public.user_roles from public, anon, authenticated;
grant select on public.user_roles to authenticated;
-- Only the trusted database migration bootstraps the first owner.
insert into public.user_roles(user_id,role) values ('036180ad-ee11-4217-a308-a2ce82367a52','owner');

-- Reads only the caller's role; definer avoids recursive RLS on user_roles.
create function public.current_admin_role() returns text
language sql stable security definer set search_path = '' as $$
 select role from public.user_roles where user_id = (select auth.uid());
$$;
revoke all on function public.current_admin_role() from public, anon, authenticated;
grant execute on function public.current_admin_role() to authenticated;
create policy roles_read on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or (select public.current_admin_role()) = 'owner');

create function public.admin_list_users()
returns table(user_id uuid,email text,role text,created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null or public.current_admin_role() is distinct from 'owner' then
  raise exception 'Owner required' using errcode = '42501';
 end if;
 return query select u.id,u.email::text,r.role,u.created_at from auth.users u
 left join public.user_roles r on r.user_id=u.id order by u.created_at;
end; $$;
revoke all on function public.admin_list_users() from public, anon, authenticated;
grant execute on function public.admin_list_users() to authenticated;

create function public.admin_set_user_role(p_user_id uuid,p_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(736419852);
 if auth.uid() is null or public.current_admin_role() is distinct from 'owner' then
  raise exception 'Owner required' using errcode = '42501';
 end if;
 if p_user_id = auth.uid() then
  raise exception 'Cannot change your own role' using errcode = '42501';
 end if;
 if p_role is not null and p_role not in ('owner','manager','staff') then
  raise exception 'Invalid role' using errcode = '22023';
 end if;
 if not exists(select 1 from auth.users where id=p_user_id) then
  raise exception 'User not found' using errcode = '22023';
 end if;
 if p_role is null then delete from public.user_roles where user_id=p_user_id;
 else insert into public.user_roles(user_id,role) values(p_user_id,p_role)
 on conflict(user_id) do update set role=excluded.role,updated_at=now(); end if;
end; $$;
revoke all on function public.admin_set_user_role(uuid,text) from public, anon, authenticated;
grant execute on function public.admin_set_user_role(uuid,text) to authenticated;

do $$ declare t text; p record; begin
 foreach t in array array['projects','project_images','project_sections','units','project_files','interest_requests'] loop
  execute format('alter table public.%I enable row level security',t);
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
   execute format('drop policy %I on public.%I',p.policyname,t);
  end loop;
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  -- Revoke column privileges left by the previous interest-request setup.
  if t='interest_requests' then
   revoke update(status,admin_notes) on public.interest_requests from authenticated;
   grant select on public.interest_requests to authenticated;
   grant update(status,admin_notes) on public.interest_requests to authenticated;
   create policy leads_read on public.interest_requests for select to authenticated
   using ((select public.current_admin_role()) in ('owner','manager','staff'));
   create policy leads_update on public.interest_requests for update to authenticated
   using ((select public.current_admin_role()) in ('owner','manager','staff'))
   with check ((select public.current_admin_role()) in ('owner','manager','staff'));
  else
   execute format('grant select on public.%I to anon,authenticated',t);
   execute format('grant insert,update,delete on public.%I to authenticated',t);
   execute format('create policy public_read on public.%I for select to anon,authenticated using(true)',t);
   execute format('create policy content_insert on public.%I for insert to authenticated with check ((select public.current_admin_role()) in (''owner'',''manager''))',t);
   execute format('create policy content_update on public.%I for update to authenticated using ((select public.current_admin_role()) in (''owner'',''manager'')) with check ((select public.current_admin_role()) in (''owner'',''manager''))',t);
   execute format('create policy content_delete on public.%I for delete to authenticated using ((select public.current_admin_role()) in (''owner'',''manager''))',t);
  end if;
 end loop;
end $$;
-- Replace only the legacy policies for the project's two buckets.
drop policy if exists "Admin Upload Images" on storage.objects;
drop policy if exists "Admin Update Images" on storage.objects;
drop policy if exists "Admin Delete Images" on storage.objects;
drop policy if exists "Admin Upload Files" on storage.objects;
drop policy if exists "Admin Update Files" on storage.objects;
drop policy if exists "Admin Delete Files" on storage.objects;
create policy content_storage_insert on storage.objects for insert to authenticated
with check(bucket_id in ('images','files') and (select public.current_admin_role()) in ('owner','manager'));
create policy content_storage_update on storage.objects for update to authenticated
using(bucket_id in ('images','files') and (select public.current_admin_role()) in ('owner','manager'))
with check(bucket_id in ('images','files') and (select public.current_admin_role()) in ('owner','manager'));
create policy content_storage_delete on storage.objects for delete to authenticated
using(bucket_id in ('images','files') and (select public.current_admin_role()) in ('owner','manager'));
comment on table public.user_roles is 'Admin roles. No role means no administrative access. Mutations only through owner-checked RPC.';
notify pgrst, 'reload schema';
commit;
