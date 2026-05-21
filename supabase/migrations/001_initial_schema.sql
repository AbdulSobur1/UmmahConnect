create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  industry text,
  career_stage text check (career_stage in ('Student','Early Career','Mid-Level','Senior','Executive','Entrepreneur')),
  country text default 'Nigeria',
  city text,
  bio text,
  skills text[],
  plan text default 'free' check (plan in ('free','pro','sponsor')),
  show_photo boolean default true,
  open_to_opportunities boolean default false,
  avatar_url text,
  created_at timestamptz default now()
);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  description text,
  is_private boolean default false,
  member_count integer default 0,
  created_at timestamptz default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  content text not null,
  community_id uuid references public.communities(id) on delete set null,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now()
);

create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (community_id, user_id)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz default now(),
  unique (requester_id, receiver_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.message_weekly_counts (
  user_id uuid references public.users(id) on delete cascade,
  week_start date not null,
  count integer default 0,
  primary key (user_id, week_start)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid references public.users(id) on delete cascade,
  title text not null,
  company text not null,
  description text,
  industry text,
  location text,
  is_remote boolean default false,
  job_type text check (job_type in ('Full-time','Part-time','Contract','Internship','Hybrid','Remote','On-site')),
  career_stage text,
  salary_range text,
  is_halal_verified boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.mentorship_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  role text check (role in ('mentor','mentee','both')),
  industries text[],
  languages text[],
  values_tags text[],
  career_stage text,
  bio text,
  years_experience integer
);

create table public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid references public.users(id) on delete cascade,
  mentor_id uuid references public.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending','accepted','declined')),
  message text,
  created_at timestamptz default now()
);

create table public.event_listings (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  event_date date,
  location_type text check (location_type in ('in-person','virtual','hybrid','In-person','Virtual','Hybrid')),
  location_detail text,
  target_industry text,
  banner_url text,
  is_active boolean default true,
  views_count integer default 0,
  clicks_count integer default 0,
  created_at timestamptz default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null,
  content text not null,
  is_read boolean default false,
  reference_id uuid,
  created_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  plan text not null,
  paystack_subscription_code text,
  paystack_customer_code text,
  status text default 'active' check (status in ('active','cancelled','expired','at_risk')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index messages_sender_id_idx on public.messages(sender_id);
create index messages_receiver_id_idx on public.messages(receiver_id);
create index messages_created_at_idx on public.messages(created_at desc);
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_is_read_idx on public.notifications(is_read);
create index connections_requester_id_idx on public.connections(requester_id);
create index connections_receiver_id_idx on public.connections(receiver_id);

alter table public.users enable row level security;
alter table public.communities enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.community_members enable row level security;
alter table public.connections enable row level security;
alter table public.messages enable row level security;
alter table public.message_weekly_counts enable row level security;
alter table public.jobs enable row level security;
alter table public.mentorship_profiles enable row level security;
alter table public.mentorship_requests enable row level security;
alter table public.event_listings enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;

create policy "users read authenticated profiles" on public.users for select to authenticated using (true);
create policy "users insert own profile" on public.users for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile" on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "users delete own profile" on public.users for delete to authenticated using (auth.uid() = id);

create policy "communities read authenticated" on public.communities for select to authenticated using (true);
create policy "community members read authenticated" on public.community_members for select to authenticated using (true);
create policy "community members join self" on public.community_members for insert to authenticated with check (auth.uid() = user_id);
create policy "community members leave self" on public.community_members for delete to authenticated using (auth.uid() = user_id);

create policy "posts read authenticated" on public.posts for select to authenticated using (true);
create policy "posts insert own" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "posts update own" on public.posts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "posts delete own" on public.posts for delete to authenticated using (auth.uid() = user_id);

create policy "comments read authenticated" on public.comments for select to authenticated using (true);
create policy "comments insert own" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "comments delete own" on public.comments for delete to authenticated using (auth.uid() = user_id);

create policy "likes read authenticated" on public.post_likes for select to authenticated using (true);
create policy "likes insert own" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "likes delete own" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

create policy "connections visible to participants" on public.connections for select to authenticated using (auth.uid() = requester_id or auth.uid() = receiver_id);
create policy "connections request self" on public.connections for insert to authenticated with check (auth.uid() = requester_id);
create policy "connections receiver can decide" on public.connections for update to authenticated using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

create policy "messages visible to participants" on public.messages for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages send self" on public.messages for insert to authenticated with check (auth.uid() = sender_id);
create policy "messages receiver can mark read" on public.messages for update to authenticated using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

create policy "weekly count own" on public.message_weekly_counts for select to authenticated using (auth.uid() = user_id);
create policy "weekly count insert own" on public.message_weekly_counts for insert to authenticated with check (auth.uid() = user_id);
create policy "weekly count update own" on public.message_weekly_counts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "jobs read active authenticated" on public.jobs for select to authenticated using (is_active = true);
create policy "jobs insert pro users" on public.jobs for insert to authenticated with check (
  auth.uid() = posted_by and exists (select 1 from public.users where users.id = auth.uid() and users.plan = 'pro')
);
create policy "jobs update owner" on public.jobs for update to authenticated using (auth.uid() = posted_by) with check (auth.uid() = posted_by);

create policy "mentorship profiles read authenticated" on public.mentorship_profiles for select to authenticated using (true);
create policy "mentorship profile insert self" on public.mentorship_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "mentorship profile update self" on public.mentorship_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "mentorship requests visible to participants" on public.mentorship_requests for select to authenticated using (auth.uid() = mentee_id or auth.uid() = mentor_id);
create policy "mentorship requests insert mentee" on public.mentorship_requests for insert to authenticated with check (auth.uid() = mentee_id);
create policy "mentorship requests mentor update" on public.mentorship_requests for update to authenticated using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

create policy "events read active authenticated" on public.event_listings for select to authenticated using (is_active = true);
create policy "events insert sponsor" on public.event_listings for insert to authenticated with check (auth.uid() = sponsor_id);
create policy "events update sponsor" on public.event_listings for update to authenticated using (auth.uid() = sponsor_id) with check (auth.uid() = sponsor_id);

create policy "notifications own" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "notifications update own" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subscriptions own" on public.subscriptions for select to authenticated using (auth.uid() = user_id);
