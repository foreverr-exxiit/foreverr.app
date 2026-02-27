-- =============================================
-- FOREVERR Database Schema — Phase 1
-- =============================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- For text search

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  ribbon_balance integer not null default 100,
  is_verified boolean not null default false,
  notification_preferences jsonb not null default '{"tributes": true, "comments": true, "followers": true, "events": true, "chat": true}'::jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_username on public.profiles using btree (username);
create index idx_profiles_username_trgm on public.profiles using gin (username gin_trgm_ops);

-- =============================================
-- MEMORIALS
-- =============================================
create table public.memorials (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid references public.profiles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  middle_name text,
  nickname text,
  date_of_birth date,
  date_of_death date,
  place_of_birth text,
  place_of_death text,
  profile_photo_url text,
  cover_photo_url text,
  obituary text,
  biography text,
  obituary_is_ai_generated boolean not null default false,
  biography_is_ai_generated boolean not null default false,
  privacy text not null default 'public' check (privacy in ('public', 'private', 'invited')),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived', 'purge_pending')),
  follower_count integer not null default 0,
  tribute_count integer not null default 0,
  slug text unique not null,
  last_interaction_at timestamptz not null default now(),
  purge_after_days integer not null default 7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_memorials_slug on public.memorials using btree (slug);
create index idx_memorials_created_by on public.memorials using btree (created_by);
create index idx_memorials_status on public.memorials using btree (status);
create index idx_memorials_name_search on public.memorials using gin (
  (first_name || ' ' || last_name) gin_trgm_ops
);

-- =============================================
-- MEMORIAL HOSTS (co-host system)
-- =============================================
create table public.memorial_hosts (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'contributor' check (role in ('owner', 'co_host', 'contributor')),
  relationship text not null check (relationship in ('immediate_family', 'extended_family', 'friend', 'colleague', 'fan')),
  relationship_detail text,
  invited_by uuid references public.profiles(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(memorial_id, user_id)
);

create index idx_memorial_hosts_memorial on public.memorial_hosts using btree (memorial_id);
create index idx_memorial_hosts_user on public.memorial_hosts using btree (user_id);

-- =============================================
-- MEMORIAL INVITATIONS
-- =============================================
create table public.memorial_invitations (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  invited_by uuid references public.profiles(id) not null,
  invited_email text,
  invited_user_id uuid references public.profiles(id),
  invite_code text unique not null default encode(gen_random_bytes(16), 'hex'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- =============================================
-- FOLLOWERS
-- =============================================
create table public.followers (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  notify_on_new_tribute boolean not null default true,
  notify_on_events boolean not null default true,
  created_at timestamptz not null default now(),
  unique(memorial_id, user_id)
);

create index idx_followers_memorial on public.followers using btree (memorial_id);
create index idx_followers_user on public.followers using btree (user_id);

-- =============================================
-- MEDIA
-- =============================================
create table public.media (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) not null,
  type text not null check (type in ('photo', 'video', 'audio')),
  storage_path text not null,
  url text not null,
  thumbnail_url text,
  caption text,
  date_taken date,
  location text,
  is_profile_photo boolean not null default false,
  is_cover_photo boolean not null default false,
  ai_restored boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_media_memorial on public.media using btree (memorial_id);

-- =============================================
-- TRIBUTES
-- =============================================
create table public.tributes (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  type text not null default 'text' check (type in ('text', 'photo', 'video', 'audio', 'memory', 'poem', 'quote')),
  content text,
  media_url text,
  is_ai_generated boolean not null default false,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  ribbon_type text not null default 'heart',
  ribbon_count integer not null default 1,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tributes_memorial on public.tributes using btree (memorial_id);
create index idx_tributes_author on public.tributes using btree (author_id);
create index idx_tributes_memorial_created on public.tributes using btree (memorial_id, created_at desc);

-- =============================================
-- TRIBUTE COMMENTS (threaded)
-- =============================================
create table public.tribute_comments (
  id uuid primary key default uuid_generate_v4(),
  tribute_id uuid references public.tributes(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  parent_comment_id uuid references public.tribute_comments(id) on delete cascade,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_comments_tribute on public.tribute_comments using btree (tribute_id);

-- =============================================
-- REACTIONS
-- =============================================
create table public.reactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_type text not null check (target_type in ('tribute', 'comment')),
  target_id uuid not null,
  reaction_type text not null check (reaction_type in ('heart', 'candle', 'flower', 'prayer', 'dove')),
  created_at timestamptz not null default now(),
  unique(user_id, target_type, target_id)
);

create index idx_reactions_target on public.reactions using btree (target_type, target_id);

-- =============================================
-- GIFT CATALOG
-- =============================================
create table public.gift_catalog (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('candle', 'flower', 'plant', 'sympathy_card', 'wreath', 'ribbon_bouquet')),
  name text not null,
  description text,
  image_url text not null,
  ribbon_cost integer not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================
-- MEMORIAL GIFTS
-- =============================================
create table public.memorial_gifts (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  gift_id uuid references public.gift_catalog(id) not null,
  message text,
  ribbon_cost integer not null,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================
-- RIBBON TRANSACTIONS
-- =============================================
create table public.ribbon_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('purchase', 'earned', 'spent_gift', 'spent_tribute', 'spent_promote', 'bonus', 'daily_reward', 'signup_bonus')),
  reference_id uuid,
  description text,
  balance_after integer not null,
  created_at timestamptz not null default now()
);

create index idx_ribbon_tx_user on public.ribbon_transactions using btree (user_id, created_at desc);

-- =============================================
-- NOTIFICATIONS
-- =============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications using btree (user_id, is_read, created_at desc);

-- =============================================
-- REPORTS (content moderation)
-- =============================================
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) not null,
  target_type text not null check (target_type in ('memorial', 'tribute', 'comment', 'user', 'message')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aliases for the same function (referenced by later migrations)
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_memorials_updated_at
  before update on public.memorials
  for each row execute function public.handle_updated_at();

create trigger set_tributes_updated_at
  before update on public.tributes
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'New User'),
    new.raw_user_meta_data->>'avatar_url'
  );
  -- Grant signup bonus ribbons
  insert into public.ribbon_transactions (user_id, amount, type, description, balance_after)
  values (new.id, 100, 'signup_bonus', 'Welcome to Foreverr!', 100);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-generate memorial slug
create or replace function public.generate_memorial_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  base_slug := lower(regexp_replace(new.first_name || '-' || new.last_name, '[^a-zA-Z0-9-]', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  while exists (select 1 from public.memorials where slug = final_slug and id != new.id) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;

  new.slug := final_slug;
  return new;
end;
$$ language plpgsql;

create trigger set_memorial_slug
  before insert on public.memorials
  for each row
  when (new.slug is null or new.slug = '')
  execute function public.generate_memorial_slug();

-- Sync follower count
create or replace function public.sync_follower_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.memorials set follower_count = follower_count + 1 where id = new.memorial_id;
  elsif TG_OP = 'DELETE' then
    update public.memorials set follower_count = follower_count - 1 where id = old.memorial_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger sync_follower_count_trigger
  after insert or delete on public.followers
  for each row execute function public.sync_follower_count();

-- Sync tribute count
create or replace function public.sync_tribute_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.memorials
    set tribute_count = tribute_count + 1, last_interaction_at = now()
    where id = new.memorial_id;
  elsif TG_OP = 'DELETE' then
    update public.memorials set tribute_count = tribute_count - 1 where id = old.memorial_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger sync_tribute_count_trigger
  after insert or delete on public.tributes
  for each row execute function public.sync_tribute_count();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.memorials enable row level security;
alter table public.memorial_hosts enable row level security;
alter table public.memorial_invitations enable row level security;
alter table public.followers enable row level security;
alter table public.media enable row level security;
alter table public.tributes enable row level security;
alter table public.tribute_comments enable row level security;
alter table public.reactions enable row level security;
alter table public.gift_catalog enable row level security;
alter table public.memorial_gifts enable row level security;
alter table public.ribbon_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- PROFILES policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- MEMORIALS policies
create policy "Public memorials are viewable by everyone"
  on public.memorials for select using (
    privacy = 'public' or
    created_by = auth.uid() or
    exists (select 1 from public.memorial_hosts where memorial_id = id and user_id = auth.uid()) or
    (privacy = 'invited' and exists (
      select 1 from public.memorial_invitations
      where memorial_id = memorials.id and (invited_user_id = auth.uid() or invited_email = auth.email())
    ))
  );

create policy "Authenticated users can create memorials"
  on public.memorials for insert with check (auth.uid() = created_by);

create policy "Hosts can update memorials"
  on public.memorials for update using (
    created_by = auth.uid() or
    exists (select 1 from public.memorial_hosts where memorial_id = id and user_id = auth.uid() and role in ('owner', 'co_host'))
  );

-- MEMORIAL HOSTS policies
create policy "Hosts are viewable on their memorials"
  on public.memorial_hosts for select using (true);

create policy "Memorial owners can manage hosts"
  on public.memorial_hosts for insert with check (
    exists (select 1 from public.memorial_hosts where memorial_id = memorial_hosts.memorial_id and user_id = auth.uid() and role = 'owner')
    or user_id = auth.uid()
  );

-- FOLLOWERS policies
create policy "Anyone can view followers"
  on public.followers for select using (true);

create policy "Users can follow memorials"
  on public.followers for insert with check (auth.uid() = user_id);

create policy "Users can unfollow"
  on public.followers for delete using (auth.uid() = user_id);

-- MEDIA policies
create policy "Media viewable on accessible memorials"
  on public.media for select using (
    exists (select 1 from public.memorials where id = memorial_id and (privacy = 'public' or created_by = auth.uid()))
  );

create policy "Authenticated users can upload media"
  on public.media for insert with check (auth.uid() = uploaded_by);

-- TRIBUTES policies
create policy "Tributes viewable on accessible memorials"
  on public.tributes for select using (
    exists (select 1 from public.memorials where id = memorial_id and (privacy = 'public' or created_by = auth.uid()))
  );

create policy "Authenticated users can create tributes"
  on public.tributes for insert with check (auth.uid() = author_id);

create policy "Authors can update own tributes"
  on public.tributes for update using (auth.uid() = author_id);

create policy "Authors can delete own tributes"
  on public.tributes for delete using (auth.uid() = author_id);

-- COMMENTS policies
create policy "Comments viewable by everyone"
  on public.tribute_comments for select using (true);

create policy "Authenticated users can comment"
  on public.tribute_comments for insert with check (auth.uid() = author_id);

create policy "Authors can delete own comments"
  on public.tribute_comments for delete using (auth.uid() = author_id);

-- REACTIONS policies
create policy "Reactions viewable by everyone"
  on public.reactions for select using (true);

create policy "Users can react"
  on public.reactions for insert with check (auth.uid() = user_id);

create policy "Users can remove own reactions"
  on public.reactions for delete using (auth.uid() = user_id);

-- GIFT CATALOG policies
create policy "Gift catalog viewable by everyone"
  on public.gift_catalog for select using (true);

-- MEMORIAL GIFTS policies
create policy "Gifts viewable on memorials"
  on public.memorial_gifts for select using (true);

create policy "Authenticated users can send gifts"
  on public.memorial_gifts for insert with check (auth.uid() = sender_id);

-- RIBBON TRANSACTIONS policies
create policy "Users can view own transactions"
  on public.ribbon_transactions for select using (auth.uid() = user_id);

-- NOTIFICATIONS policies
create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- REPORTS policies
create policy "Users can create reports"
  on public.reports for insert with check (auth.uid() = reporter_id);

-- INVITATIONS policies
create policy "Users can view own invitations"
  on public.memorial_invitations for select using (
    invited_user_id = auth.uid() or invited_by = auth.uid()
  );

create policy "Hosts can create invitations"
  on public.memorial_invitations for insert with check (auth.uid() = invited_by);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
insert into storage.buckets (id, name, public) values ('profile-photos', 'profile-photos', true);
insert into storage.buckets (id, name, public) values ('memorial-photos', 'memorial-photos', true);
insert into storage.buckets (id, name, public) values ('memorial-videos', 'memorial-videos', true);
insert into storage.buckets (id, name, public) values ('memorial-audio', 'memorial-audio', false);

-- Storage policies
create policy "Anyone can view profile photos"
  on storage.objects for select using (bucket_id = 'profile-photos');

create policy "Users can upload profile photos"
  on storage.objects for insert with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view memorial photos"
  on storage.objects for select using (bucket_id = 'memorial-photos');

create policy "Authenticated users can upload memorial photos"
  on storage.objects for insert with check (bucket_id = 'memorial-photos' and auth.role() = 'authenticated');

create policy "Anyone can view memorial videos"
  on storage.objects for select using (bucket_id = 'memorial-videos');

create policy "Authenticated users can upload memorial videos"
  on storage.objects for insert with check (bucket_id = 'memorial-videos' and auth.role() = 'authenticated');
