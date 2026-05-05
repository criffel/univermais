-- Core schema + RLS multi-tenant
create extension if not exists "uuid-ossp";

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('company','institution','family')),
  created_at timestamptz default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null
);

create table if not exists users_profiles (
  id uuid primary key,
  organization_id uuid references organizations(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  role_key text not null,
  created_at timestamptz default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  workload_hours int default 0,
  is_active boolean default true,
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists learning_paths (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists learning_path_courses (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references learning_paths(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  min_score numeric default 70,
  attempts_allowed int default 2,
  created_at timestamptz default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null,
  course_id uuid not null references courses(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed','failed','expired')),
  progress numeric default 0,
  created_at timestamptz default now()
);

-- Placeholder tables requested
create table if not exists course_modules (id uuid primary key default gen_random_uuid(), course_id uuid references courses(id), title text);
create table if not exists lessons (id uuid primary key default gen_random_uuid(), module_id uuid references course_modules(id), title text, content_type text, content_url text);
create table if not exists questions (id uuid primary key default gen_random_uuid(), assessment_id uuid references assessments(id), statement text, question_type text);
create table if not exists answers (id uuid primary key default gen_random_uuid(), question_id uuid references questions(id), user_id uuid, answer_text text, is_correct boolean);
create table if not exists certificates (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id), user_id uuid, course_id uuid references courses(id), validation_code text unique, issued_at timestamptz default now());
create table if not exists notifications (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id), user_id uuid, title text, body text, read_at timestamptz);
create table if not exists announcements (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id), title text, body text, created_at timestamptz default now());
create table if not exists sectors (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id), name text);
create table if not exists positions (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id), name text);
create table if not exists classes (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id), name text);
create table if not exists parent_child_links (id uuid primary key default gen_random_uuid(), parent_user_id uuid, child_user_id uuid);
create table if not exists files (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id), name text, url text, category text);
create table if not exists activity_logs (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id), user_id uuid, action text, metadata jsonb, created_at timestamptz default now());

alter table organizations enable row level security;
alter table users_profiles enable row level security;
alter table courses enable row level security;
alter table learning_paths enable row level security;
alter table assessments enable row level security;
alter table enrollments enable row level security;

create or replace function is_super_admin(uid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from users_profiles up where up.id = uid and up.role_key = 'super_admin');
$$;

create policy org_read on organizations for select using (
  is_super_admin(auth.uid()) or id in (select organization_id from users_profiles where id = auth.uid())
);

create policy tenant_rw_users on users_profiles for all using (
  is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid())
);

create policy tenant_rw_courses on courses for all using (
  is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid())
);

create policy tenant_rw_paths on learning_paths for all using (
  is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid())
);

create policy tenant_rw_assessments on assessments for all using (
  is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid())
);

create policy tenant_rw_enrollments on enrollments for all using (
  is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid())
);

insert into roles (key, name) values
('super_admin','Super Admin'),('org_admin','Administrador'),('coordinator','Coordenador'),('instructor','Professor/Instrutor'),('manager','Gestor'),('student','Aluno/Colaborador'),('parent','Responsável'),('child','Filho')
on conflict (key) do nothing;

-- Hardening additions
alter table announcements enable row level security;
alter table notifications enable row level security;
alter table certificates enable row level security;
alter table files enable row level security;
alter table sectors enable row level security;
alter table positions enable row level security;
alter table classes enable row level security;
alter table activity_logs enable row level security;

create policy tenant_rw_announcements on announcements for all
using (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()))
with check (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()));

create policy tenant_rw_notifications on notifications for all
using (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()))
with check (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()));

create policy tenant_rw_certificates on certificates for all
using (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()))
with check (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()));

create policy tenant_rw_files on files for all
using (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()))
with check (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()));

create policy tenant_rw_sectors on sectors for all
using (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()))
with check (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()));

create policy tenant_rw_positions on positions for all
using (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()))
with check (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()));

create policy tenant_rw_classes on classes for all
using (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()))
with check (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()));

create policy tenant_rw_activity_logs on activity_logs for all
using (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()))
with check (is_super_admin(auth.uid()) or organization_id in (select organization_id from users_profiles where id = auth.uid()));
