-- تجميع ودمج ملفات قاعدة البيانات والتخزين
-- تم التحديث لاستخدام البريد الإلكتروني: zohairmasaken@gmail.com

-- 1. تفعيل الإضافات الضرورية
create extension if not exists "pgcrypto";

-- 2. إعداد الجداول (Tables Setup)

-- جدول المشاريع (projects)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  slug text,
  description text,
  location text,
  start_year integer,
  status text default 'upcoming',
  main_image text,
  brochure text,
  link text
);

-- جدول صور المشاريع (project_images)
create table if not exists public.project_images (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade,
  image_url text,
  type text default 'gallery'
);

-- جدول أقسام المشروع (project_sections)
create table if not exists public.project_sections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade,
  name text,
  description text,
  plan_image text,
  brochure text
);

-- جدول الوحدات (units)
create table if not exists public.units (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  section_id uuid references public.project_sections(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  unit_number text,
  type text,
  size numeric,
  price numeric,
  status text default 'available',
  main_image text,
  model_details text,
  model_count integer
);

-- جدول الملفات الإضافية (project_files)
create table if not exists public.project_files (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade,
  file_url text,
  name text,
  type text
);

-- 3. تفعيل الحماية (RLS)
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.project_sections enable row level security;
alter table public.units enable row level security;
alter table public.project_files enable row level security;

-- 4. إنشاء المستخدم المسؤول (Admin User Creation)
DO $$
DECLARE
  user_id uuid := gen_random_uuid();
  admin_email text := 'zohairmasaken@gmail.com';
  admin_password text := 'Zizo@s1999@';
BEGIN
  -- التحقق مما إذا كان المستخدم موجوداً لتجنب التكرار
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', admin_email,
      crypt(admin_password, gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Zohair"}',
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), user_id, format('{"sub":"%s","email":"%s"}', user_id, admin_email)::jsonb,
      'email', user_id::text, now(), now(), now()
    );
  END IF;
END $$;

-- 5. سياسات الأمان (Policies) للجداول
-- حذف السياسات القديمة
drop policy if exists "Public Read Projects" on public.projects;
drop policy if exists "Public Read Images" on public.project_images;
drop policy if exists "Public Read Sections" on public.project_sections;
drop policy if exists "Public Read Units" on public.units;
drop policy if exists "Public Read Files" on public.project_files;

drop policy if exists "Admin Full Access Projects" on public.projects;
drop policy if exists "Admin Full Access Images" on public.project_images;
drop policy if exists "Admin Full Access Sections" on public.project_sections;
drop policy if exists "Admin Full Access Units" on public.units;
drop policy if exists "Admin Full Access Files" on public.project_files;

-- السماح للجميع بالقراءة
create policy "Public Read Projects" on public.projects for select using (true);
create policy "Public Read Images" on public.project_images for select using (true);
create policy "Public Read Sections" on public.project_sections for select using (true);
create policy "Public Read Units" on public.units for select using (true);
create policy "Public Read Files" on public.project_files for select using (true);

-- السماح للمدير فقط بالتعديل والإضافة والحذف
create policy "Admin Full Access Projects" on public.projects for all using ((auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com');
create policy "Admin Full Access Images" on public.project_images for all using ((auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com');
create policy "Admin Full Access Sections" on public.project_sections for all using ((auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com');
create policy "Admin Full Access Units" on public.units for all using ((auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com');
create policy "Admin Full Access Files" on public.project_files for all using ((auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com');

-- 6. إعداد التخزين (Storage Setup)
-- إنشاء Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- حذف سياسات التخزين القديمة
DROP POLICY IF EXISTS "Public Access Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;

DROP POLICY IF EXISTS "Public Access Files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Files" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Files" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Files" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Files" ON storage.objects;

-- سياسات الصور (Images)
-- قراءة للجميع
CREATE POLICY "Public Access Images" ON storage.objects FOR SELECT USING ( bucket_id = 'images' );
-- تعديل للمدير فقط
CREATE POLICY "Admin Upload Images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'images' AND (auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com' );
CREATE POLICY "Admin Update Images" ON storage.objects FOR UPDATE USING ( bucket_id = 'images' AND (auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com' );
CREATE POLICY "Admin Delete Images" ON storage.objects FOR DELETE USING ( bucket_id = 'images' AND (auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com' );

-- سياسات الملفات (Files)
-- قراءة للجميع
CREATE POLICY "Public Access Files" ON storage.objects FOR SELECT USING ( bucket_id = 'files' );
-- تعديل للمدير فقط
CREATE POLICY "Admin Upload Files" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'files' AND (auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com' );
CREATE POLICY "Admin Update Files" ON storage.objects FOR UPDATE USING ( bucket_id = 'files' AND (auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com' );
CREATE POLICY "Admin Delete Files" ON storage.objects FOR DELETE USING ( bucket_id = 'files' AND (auth.jwt() ->> 'email') = 'zohairmasaken@gmail.com' );
