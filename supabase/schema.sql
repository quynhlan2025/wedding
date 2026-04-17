-- ============================================================
-- CLB GYM Mạnh Cường — Admin Dashboard Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Hero content (single row, id = 1)
create table if not exists public.hero_content (
  id         bigint primary key default 1,
  headline   text not null default 'Rèn Luyện Thân Thể & Tâm Trí',
  subtext    text not null default 'Phòng gym & yoga đẳng cấp với huấn luyện viên chuyên nghiệp.',
  bg_image_url text not null default 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=75&auto=format&fit=crop',
  updated_at timestamptz default now()
);
insert into public.hero_content (id) values (1) on conflict do nothing;

-- About content (single row, id = 1)
create table if not exists public.about_content (
  id                  bigint primary key default 1,
  title               text  not null default 'Nơi Giới Hạn Bị Phá Vỡ',
  description         text  not null default 'CLB GYM Mạnh Cường không chỉ là phòng gym — đây là nơi bạn khám phá phiên bản tốt nhất của chính mình.',
  years_experience    text  not null default '8+',
  features            jsonb not null default '[]',
  main_image_url      text  not null default '',
  secondary_image_url text  not null default '',
  updated_at          timestamptz default now()
);
insert into public.about_content (id) values (1) on conflict do nothing;

-- Services
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  image_url   text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz default now()
);

-- Classes
create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  category    text not null default 'Gym',
  name        text not null,
  description text not null default '',
  duration    text not null default '60 phút',
  level       text not null default 'Cơ bản',
  calories    text not null default '300-500',
  icon        text not null default '🏋️',
  image_url   text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz default now()
);

-- Trainers
create table if not exists public.trainers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null default '',
  photo_url     text not null default '',
  specialty     text not null default '',
  experience    text not null default '',
  certification text not null default '',
  color         text not null default '#E8192C',
  sort_order    int  not null default 0,
  created_at    timestamptz default now()
);

-- Pricing plans
create table if not exists public.pricing_plans (
  id           uuid    primary key default gen_random_uuid(),
  name         text    not null,
  price        text    not null default '',
  period       text    not null default '/tháng',
  description  text    not null default '',
  popular      boolean not null default false,
  color        text    not null default '#ffffff',
  features     jsonb   not null default '[]',
  not_included jsonb   not null default '[]',
  sort_order   int     not null default 0,
  created_at   timestamptz default now()
);

-- Testimonials
create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text not null default '',
  quote      text not null default '',
  stars      int  not null default 5,
  months     text not null default '',
  initials   text not null default '',
  sort_order int  not null default 0,
  created_at timestamptz default now()
);

-- Stats
create table if not exists public.stats (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  value      text not null default '',
  sort_order int  not null default 0,
  created_at timestamptz default now()
);

-- Contact settings (single row, id = 1)
create table if not exists public.contact_settings (
  id              bigint primary key default 1,
  address_line1   text  not null default '',
  address_line2   text  not null default '',
  phone           text  not null default '',
  email           text  not null default '',
  hours_weekdays  text  not null default '',
  hours_weekend   text  not null default '',
  social_links    jsonb not null default '[]',
  updated_at      timestamptz default now()
);
insert into public.contact_settings (id) values (1) on conflict do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.about_content    enable row level security;
alter table public.hero_content     enable row level security;
alter table public.services         enable row level security;
alter table public.classes          enable row level security;
alter table public.trainers         enable row level security;
alter table public.pricing_plans    enable row level security;
alter table public.testimonials     enable row level security;
alter table public.stats            enable row level security;
alter table public.contact_settings enable row level security;

-- Everyone can read (public site reads data)
create policy "public read about"       on public.about_content    for select using (true);
create policy "auth write about"       on public.about_content    for all using (auth.role() = 'authenticated');
create policy "public read hero"        on public.hero_content     for select using (true);
create policy "public read services"    on public.services         for select using (true);
create policy "public read classes"     on public.classes          for select using (true);
create policy "public read trainers"    on public.trainers         for select using (true);
create policy "public read pricing"     on public.pricing_plans    for select using (true);
create policy "public read testimonials"on public.testimonials     for select using (true);
create policy "public read stats"       on public.stats            for select using (true);
create policy "public read contact"     on public.contact_settings for select using (true);

-- Only authenticated users (admin) can write
create policy "auth write hero"        on public.hero_content     for all using (auth.role() = 'authenticated');
create policy "auth write services"    on public.services         for all using (auth.role() = 'authenticated');
create policy "auth write classes"     on public.classes          for all using (auth.role() = 'authenticated');
create policy "auth write trainers"    on public.trainers         for all using (auth.role() = 'authenticated');
create policy "auth write pricing"     on public.pricing_plans    for all using (auth.role() = 'authenticated');
create policy "auth write testimonials"on public.testimonials     for all using (auth.role() = 'authenticated');
create policy "auth write stats"       on public.stats            for all using (auth.role() = 'authenticated');
create policy "auth write contact"     on public.contact_settings for all using (auth.role() = 'authenticated');
