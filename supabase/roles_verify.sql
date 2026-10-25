begin;
-- All fixtures and role changes are rolled back.
insert into public.projects(id,name) values ('00000000-1111-4222-8333-000000000001','RBAC verification');
insert into public.interest_requests(id,full_name,phone,interest,contact_consent)
values ('00000000-1111-4222-8333-000000000002','RBAC verification','+966500000000','استفسار آخر',true);
select set_config('request.jwt.claims','{"sub":"036180ad-ee11-4217-a308-a2ce82367a52","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 if public.current_admin_role() is distinct from 'owner' then raise exception 'Owner lookup failed'; end if;
 perform public.admin_list_users();
 begin
  perform public.admin_set_user_role(auth.uid(),'staff');
  raise exception 'Self demotion unexpectedly allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
-- A temporary role for an existing non-owner account.
insert into public.user_roles(user_id,role)
select id,'manager' from auth.users where id<>'036180ad-ee11-4217-a308-a2ce82367a52' order by id limit 1
on conflict(user_id) do update set role='manager';
select set_config('request.jwt.claims',json_build_object('sub',(select user_id from public.user_roles where role='manager' limit 1),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare affected integer; begin
 if public.current_admin_role() is distinct from 'manager' then raise exception 'Manager lookup failed'; end if;
 update public.projects set name='Manager edit verified' where id='00000000-1111-4222-8333-000000000001';
 get diagnostics affected=row_count;
 if affected<>1 then raise exception 'Manager edit denied'; end if;
 begin perform public.admin_list_users(); raise exception 'Manager users access allowed'; exception when insufficient_privilege then null; end;
 begin update public.user_roles set role='owner' where user_id=auth.uid(); raise exception 'Role escalation allowed'; exception when insufficient_privilege then null; end;
 begin perform public.admin_set_user_role(auth.uid(),'owner'); raise exception 'Manager escalation allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.user_roles set role='staff' where role='manager';
set local role authenticated;
do $$ declare affected integer; begin
 if public.current_admin_role() is distinct from 'staff' then raise exception 'Staff lookup failed'; end if;
 update public.projects set name='Forbidden staff edit' where id='00000000-1111-4222-8333-000000000001';
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Staff edited project'; end if;
 update public.interest_requests set status='contacted' where id='00000000-1111-4222-8333-000000000002';
 get diagnostics affected=row_count;
 if affected<>1 then raise exception 'Staff cannot follow up'; end if;
 begin
  update public.interest_requests set phone='+966511111111' where id='00000000-1111-4222-8333-000000000002';
  raise exception 'Staff modified customer data';
 exception when insufficient_privilege then null; end;
 begin perform public.admin_set_user_role(auth.uid(),'owner'); raise exception 'Staff escalation allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from public.user_roles where role='staff';
set local role authenticated;
do $$ declare affected integer; begin
 if public.current_admin_role() is not null then raise exception 'Unassigned user has role'; end if;
 if exists(select 1 from public.interest_requests) then raise exception 'Unassigned user sees leads'; end if;
 update public.projects set name='Forbidden edit' where id='00000000-1111-4222-8333-000000000001';
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Unassigned user edited project'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
 if not exists(select 1 from public.projects where id='00000000-1111-4222-8333-000000000001') then raise exception 'Public read blocked'; end if;
 begin perform 1 from public.interest_requests; raise exception 'Anon sees leads'; exception when insufficient_privilege then null; end;
 perform public.register_interest('RBAC submission verification','+966599999999','استفسار آخر','',true,'');
end $$;
reset role;
rollback;
select 'PASS: owner, manager, staff, unassigned, public read, public interest RPC, escalation denied; fixtures rolled back' as verification;
