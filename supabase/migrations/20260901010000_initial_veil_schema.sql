create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  veil_number text not null unique,
  bio text not null default '',
  avatar_url text,
  interests text[] not null default '{}',
  is_creator boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('confession', 'pensee', 'debat', 'humour')),
  body text not null check (char_length(body) between 1 and 5000),
  visibility text not null default 'public' check (visibility in ('public', 'community')),
  community_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  cloudinary_public_id text not null,
  secure_url text not null,
  resource_type text not null check (resource_type in ('image', 'video')),
  width integer,
  height integer,
  duration numeric,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, reaction)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.coin_wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 200 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists comments_post_id_idx on public.comments(post_id, created_at);
create index if not exists notifications_recipient_idx on public.notifications(recipient_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.notifications enable row level security;
alter table public.coin_wallets enable row level security;
alter table public.follows enable row level security;

drop policy if exists "Follows are publicly readable" on public.follows;
create policy "Follows are publicly readable" on public.follows for select using (true);
drop policy if exists "Users manage their follows" on public.follows;
create policy "Users manage their follows" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable" on public.profiles for select using (true);
drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Public posts are readable" on public.posts;
create policy "Public posts are readable" on public.posts for select using (visibility = 'public' or author_id = auth.uid());
drop policy if exists "Users can create their posts" on public.posts;
create policy "Users can create their posts" on public.posts for insert with check (auth.uid() = author_id);
drop policy if exists "Users can update their posts" on public.posts;
create policy "Users can update their posts" on public.posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists "Users can delete their posts" on public.posts;
create policy "Users can delete their posts" on public.posts for delete using (auth.uid() = author_id);

drop policy if exists "Post media follows post visibility" on public.post_media;
create policy "Post media follows post visibility" on public.post_media for select using (owner_id = auth.uid() or exists (select 1 from public.posts where posts.id = post_media.post_id and posts.visibility = 'public'));
drop policy if exists "Users can attach their media" on public.post_media;
create policy "Users can attach their media" on public.post_media for insert with check (auth.uid() = owner_id);

drop policy if exists "Comments are readable on public posts" on public.comments;
create policy "Comments are readable on public posts" on public.comments for select using (exists (select 1 from public.posts where posts.id = comments.post_id and posts.visibility = 'public'));
drop policy if exists "Users can create comments" on public.comments;
create policy "Users can create comments" on public.comments for insert with check (auth.uid() = author_id);
drop policy if exists "Users can delete their comments" on public.comments;
create policy "Users can delete their comments" on public.comments for delete using (auth.uid() = author_id);

drop policy if exists "Reactions are readable" on public.reactions;
create policy "Reactions are readable" on public.reactions for select using (true);
drop policy if exists "Users manage their reactions" on public.reactions;
create policy "Users manage their reactions" on public.reactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read their notifications" on public.notifications;
create policy "Users read their notifications" on public.notifications for select using (auth.uid() = recipient_id);
drop policy if exists "Users update their notifications" on public.notifications;
create policy "Users update their notifications" on public.notifications for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

drop policy if exists "Users read their wallet" on public.coin_wallets;
create policy "Users read their wallet" on public.coin_wallets for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  generated_username text;
begin
  generated_username := coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'veil_user_' || substr(new.id::text, 1, 8));
  insert into public.profiles (id, username, veil_number)
  values (new.id, generated_username, lpad((floor(random() * 1000000))::text, 6, '0'))
  on conflict (id) do nothing;
  insert into public.coin_wallets (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
