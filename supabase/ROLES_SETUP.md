# Administrative roles

Applied to project `mekzwhamhoberorisdcv`. `roles_setup.sql` is the one-time setup snapshot; do not run it again on an initialized database.

`public.user_roles` references `auth.users` by UUID. Missing row means no administrative access.

| Role | Access |
| --- | --- |
| owner | Content, leads, account listing and assigning/removing roles |
| manager | Content and leads |
| staff | Read leads and update status/admin_notes only |

Public content reads and the validated `register_interest` RPC remain available to visitors. Storage writes in `images` and `files` require owner or manager.

The dashboard checks the caller's database role on entry, window focus and every minute. Database policies check the role on each request. Permission changes do not depend on refreshing a JWT. Previously fetched information cannot be recalled from a browser.

Owners manage roles in Dashboard → المستخدمون والصلاحيات. Accounts must already exist in Supabase Authentication. Selecting “بدون صلاحيات” removes the role, not the account. Direct client writes to user_roles are revoked. Owner-only RPCs have an explicit auth.uid check and empty search_path. An owner cannot change their own role; role changes are serialized.

The initial owner is UUID `036180ad-ee11-4217-a308-a2ce82367a52`, verified against the live account before applying. Database administrators can recover access using SQL; never put a service-role key in the frontend.

Verification: `roles_verify.sql` executes checks in a transaction and rolls back all fixtures and temporary role assignments. It covers owner access, manager content edits, staff follow-up, anonymous submissions, unassigned users and privilege escalation attempts. Run only against a controlled database session.

Supabase security advisor flags SECURITY DEFINER RPC exposure; these RPCs are intentionally callable with internal authorization checks. register_interest intentionally accepts anonymous submissions. Existing leaked-password protection setting is unrelated and unchanged.

The Supabase CLI was unavailable in this workspace, so no CLI migration-history snapshot was generated. Do not reapply the old full_db_setup.sql after this change: its email-based policies would restore the previous authorization model.
