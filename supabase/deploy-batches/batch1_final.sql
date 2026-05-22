-- BATCH 1 OF 4: Migrations 00006-00013 (SAFE — skips existing objects)

-- === 00006_marketplace.sql ===
-- =============================================
-- MARKETPLACE — Phase 3 Sprint 1
-- =============================================

-- MARKETPLACE CATEGORIES (lookup table)
create table public.marketplace_categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  icon_name text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

insert into public.marketplace_categories (slug, name, description, icon_name, sort_order) values
  ('caskets', 'Caskets & Urns', 'Burial caskets, cremation urns, and keepsake containers', 'archive', 1),
  ('flowers', 'Flowers & Arrangements', 'Funeral flowers, wreaths, and floral arrangements', 'flower', 2),
  ('headstones', 'Headstones & Monuments', 'Grave markers, headstones, and memorial monuments', 'monument', 3),
  ('clothing', 'Memorial Clothing', 'Custom memorial t-shirts, hoodies, and apparel', 'shirt', 4),
  ('keepsakes', 'Keepsakes & Jewelry', 'Memorial jewelry, photo frames, and keepsakes', 'heart', 5),
  ('printing', 'Printing & Programs', 'Funeral programs, prayer cards, and memorial books', 'book-open', 6),
  ('cleaning', 'Grave Cleaning Services', 'Professional grave cleaning and maintenance', 'sparkles', 7),
  ('funeral-services', 'Funeral Services', 'Full-service funeral planning and coordination', 'building', 8),
  ('catering', 'Catering & Repast', 'Post-funeral meal and catering services', 'utensils', 9),
  ('other', 'Other', 'Other memorial-related products and services', 'more-horizontal', 10);

-- MARKETPLACE LISTINGS
create table public.marketplace_listings (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.marketplace_categories(id) not null,
  title text not null,
  description text,
  price_cents integer not null,
  currency text not null default 'usd',
  listing_type text not null default 'product' check (listing_type in ('product', 'service')),
  condition text check (condition in ('new', 'like_new', 'good', 'fair', null)),
  images text[] not null default '{}',
  location text,
  latitude double precision,
  longitude double precision,
  shipping_available boolean not null default false,
  shipping_price_cents integer,
  is_featured boolean not null default false,
  is_promoted boolean not null default false,
  promoted_until timestamptz,
  status text not null default 'draft' check (status in ('draft', 'active', 'sold', 'paused', 'removed')),
  view_count integer not null default 0,
  inquiry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_listings_seller on public.marketplace_listings using btree (seller_id);
create index idx_listings_category on public.marketplace_listings using btree (category_id);
create index idx_listings_status on public.marketplace_listings using btree (status);
create index idx_listings_price on public.marketplace_listings using btree (price_cents);
create index idx_listings_location on public.marketplace_listings using gist (
  point(longitude, latitude)
) where latitude is not null;
create index idx_listings_title_trgm on public.marketplace_listings using gin (title gin_trgm_ops);

-- LISTING INQUIRIES (buyer → seller communication)
create table public.listing_inquiries (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.marketplace_listings(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'replied', 'accepted', 'declined', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_inquiries_listing on public.listing_inquiries using btree (listing_id);
create index idx_inquiries_buyer on public.listing_inquiries using btree (buyer_id);

-- INQUIRY MESSAGES (threaded conversation per inquiry)
create table public.inquiry_messages (
  id uuid primary key default uuid_generate_v4(),
  inquiry_id uuid references public.listing_inquiries(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_inquiry_messages on public.inquiry_messages using btree (inquiry_id, created_at);

-- SAVED LISTINGS (favorites/bookmarks)
create table public.saved_listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.marketplace_listings(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

-- SELLER PROFILES (extended info for sellers)
create table public.seller_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  business_name text,
  business_description text,
  business_type text check (business_type in ('individual', 'business', 'nonprofit')),
  website_url text,
  phone text,
  address text,
  latitude double precision,
  longitude double precision,
  is_verified boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  total_sales integer not null default 0,
  response_time_hours integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SELLER REVIEWS
create table public.seller_reviews (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.seller_profiles(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text,
  created_at timestamptz not null default now(),
  unique(seller_id, reviewer_id, listing_id)
);

create index idx_seller_reviews on public.seller_reviews using btree (seller_id);

-- TRIGGERS

create trigger set_listings_updated_at
  before update on public.marketplace_listings
  for each row execute function public.handle_updated_at();

create trigger set_inquiries_updated_at
  before update on public.listing_inquiries
  for each row execute function public.handle_updated_at();

create trigger set_seller_profiles_updated_at
  before update on public.seller_profiles
  for each row execute function public.handle_updated_at();

-- Sync seller rating when review is added
create or replace function public.sync_seller_rating()
returns trigger as $$
begin
  update public.seller_profiles
  set rating_avg = (
    select coalesce(avg(rating), 0) from public.seller_reviews where seller_id = new.seller_id
  ),
  rating_count = (
    select count(*) from public.seller_reviews where seller_id = new.seller_id
  )
  where id = new.seller_id;
  return new;
end;
$$ language plpgsql;

create trigger sync_seller_rating_trigger
  after insert or update or delete on public.seller_reviews
  for each row execute function public.sync_seller_rating();

-- Sync inquiry count on listing
create or replace function public.sync_inquiry_count()
returns trigger as $$
begin
  update public.marketplace_listings
  set inquiry_count = (
    select count(*) from public.listing_inquiries where listing_id = new.listing_id
  )
  where id = new.listing_id;
  return new;
end;
$$ language plpgsql;

create trigger sync_inquiry_count_trigger
  after insert on public.listing_inquiries
  for each row execute function public.sync_inquiry_count();

-- ROW LEVEL SECURITY

alter table public.marketplace_categories enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.listing_inquiries enable row level security;
alter table public.inquiry_messages enable row level security;
alter table public.saved_listings enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.seller_reviews enable row level security;

-- Categories: public read
create policy "Categories viewable by everyone"
  on public.marketplace_categories for select using (is_active = true);

-- Listings: active listings are public
create policy "Active listings viewable by everyone"
  on public.marketplace_listings for select using (
    status = 'active' or seller_id = auth.uid()
  );

create policy "Sellers can create listings"
  on public.marketplace_listings for insert with check (auth.uid() = seller_id);

create policy "Sellers can update own listings"
  on public.marketplace_listings for update using (auth.uid() = seller_id);

create policy "Sellers can delete own listings"
  on public.marketplace_listings for delete using (auth.uid() = seller_id);

-- Inquiries: visible to buyer and seller
create policy "Inquiry participants can view"
  on public.listing_inquiries for select using (
    buyer_id = auth.uid() or
    exists (select 1 from public.marketplace_listings where id = listing_id and seller_id = auth.uid())
  );

create policy "Buyers can create inquiries"
  on public.listing_inquiries for insert with check (auth.uid() = buyer_id);

create policy "Participants can update inquiries"
  on public.listing_inquiries for update using (
    buyer_id = auth.uid() or
    exists (select 1 from public.marketplace_listings where id = listing_id and seller_id = auth.uid())
  );

-- Inquiry messages
create policy "Inquiry participants can view messages"
  on public.inquiry_messages for select using (
    exists (
      select 1 from public.listing_inquiries
      where id = inquiry_id and (
        buyer_id = auth.uid() or
        exists (select 1 from public.marketplace_listings where id = listing_id and seller_id = auth.uid())
      )
    )
  );

create policy "Participants can send messages"
  on public.inquiry_messages for insert with check (auth.uid() = sender_id);

-- Saved listings
create policy "Users can view own saved listings"
  on public.saved_listings for select using (auth.uid() = user_id);

create policy "Users can save listings"
  on public.saved_listings for insert with check (auth.uid() = user_id);

create policy "Users can unsave listings"
  on public.saved_listings for delete using (auth.uid() = user_id);

-- Seller profiles
create policy "Seller profiles viewable by everyone"
  on public.seller_profiles for select using (true);

create policy "Users can create own seller profile"
  on public.seller_profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own seller profile"
  on public.seller_profiles for update using (auth.uid() = user_id);

-- Seller reviews
create policy "Reviews viewable by everyone"
  on public.seller_reviews for select using (true);

create policy "Authenticated users can leave reviews"
  on public.seller_reviews for insert with check (auth.uid() = reviewer_id);

-- Storage bucket for listing images
insert into storage.buckets (id, name, public) values ('marketplace-images', 'marketplace-images', true);

create policy "Anyone can view marketplace images"
  on storage.objects for select using (bucket_id = 'marketplace-images');

create policy "Authenticated users can upload marketplace images"
  on storage.objects for insert with check (bucket_id = 'marketplace-images' and auth.role() = 'authenticated');

-- === 00007_directory.sql ===
-- =============================================
-- FUNERAL DIRECTORY — Phase 3 Sprint 2
-- =============================================

-- DIRECTORY LISTINGS (funeral homes, cemeteries, florists, etc.)
create table public.directory_listings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  business_name text not null,
  business_type text not null check (business_type in (
    'funeral_home', 'cemetery', 'crematorium', 'florist', 'catering',
    'monument_maker', 'grief_counselor', 'estate_planner', 'transport',
    'cleaning_service', 'photographer', 'musician', 'celebrant', 'other'
  )),
  description text,
  services text[] not null default '{}',
  price_range text check (price_range in ('$', '$$', '$$$', '$$$$')),
  phone text,
  email text,
  website_url text,
  address text not null,
  city text not null,
  state text,
  zip_code text,
  country text not null default 'US',
  latitude double precision,
  longitude double precision,
  cover_image_url text,
  gallery_images text[] not null default '{}',
  hours_of_operation jsonb,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  review_count integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_directory_type on public.directory_listings using btree (business_type);
create index idx_directory_city on public.directory_listings using btree (city, state);
create index idx_directory_status on public.directory_listings using btree (status);
create index idx_directory_name_trgm on public.directory_listings using gin (business_name gin_trgm_ops);
create index idx_directory_location on public.directory_listings using gist (
  point(longitude, latitude)
) where latitude is not null;

-- DIRECTORY REVIEWS
create table public.directory_reviews (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.directory_listings(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  review_text text,
  visit_date date,
  is_verified_visit boolean not null default false,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(listing_id, reviewer_id)
);

create index idx_directory_reviews_listing on public.directory_reviews using btree (listing_id);

-- DIRECTORY LEADS (request quote / book now)
create table public.directory_leads (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.directory_listings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  service_type text,
  preferred_date date,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_directory_leads_listing on public.directory_leads using btree (listing_id);

-- TRIGGERS

create trigger set_directory_listings_updated_at
  before update on public.directory_listings
  for each row execute function public.handle_updated_at();

create trigger set_directory_reviews_updated_at
  before update on public.directory_reviews
  for each row execute function public.handle_updated_at();

create trigger set_directory_leads_updated_at
  before update on public.directory_leads
  for each row execute function public.handle_updated_at();

-- Sync directory rating
create or replace function public.sync_directory_rating()
returns trigger as $$
begin
  update public.directory_listings
  set rating_avg = (
    select coalesce(avg(rating), 0) from public.directory_reviews where listing_id = new.listing_id
  ),
  rating_count = (
    select count(*) from public.directory_reviews where listing_id = new.listing_id
  ),
  review_count = (
    select count(*) from public.directory_reviews where listing_id = new.listing_id
  )
  where id = new.listing_id;
  return new;
end;
$$ language plpgsql;

create trigger sync_directory_rating_trigger
  after insert or update or delete on public.directory_reviews
  for each row execute function public.sync_directory_rating();

-- ROW LEVEL SECURITY

alter table public.directory_listings enable row level security;
alter table public.directory_reviews enable row level security;
alter table public.directory_leads enable row level security;

-- Directory listings: active are public
create policy "Active directory listings viewable by everyone"
  on public.directory_listings for select using (
    status = 'active' or owner_id = auth.uid()
  );

create policy "Users can create directory listings"
  on public.directory_listings for insert with check (auth.uid() = owner_id);

create policy "Owners can update own listings"
  on public.directory_listings for update using (auth.uid() = owner_id);

-- Reviews
create policy "Directory reviews viewable by everyone"
  on public.directory_reviews for select using (true);

create policy "Authenticated users can leave directory reviews"
  on public.directory_reviews for insert with check (auth.uid() = reviewer_id);

create policy "Reviewers can update own reviews"
  on public.directory_reviews for update using (auth.uid() = reviewer_id);

-- Leads: visible to listing owner and lead creator
create policy "Lead participants can view"
  on public.directory_leads for select using (
    user_id = auth.uid() or
    exists (select 1 from public.directory_listings where id = listing_id and owner_id = auth.uid())
  );

create policy "Users can create leads"
  on public.directory_leads for insert with check (auth.uid() = user_id or user_id is null);

create policy "Listing owners can update leads"
  on public.directory_leads for update using (
    exists (select 1 from public.directory_listings where id = listing_id and owner_id = auth.uid())
  );

-- === 00008_nft_system.sql ===
-- =============================================
-- NFT SYSTEM — Phase 3 Sprint 3
-- =============================================

-- NFTs
create table public.nfts (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  media_url text not null,
  thumbnail_url text,
  token_id text,
  contract_address text,
  chain text not null default 'polygon',
  price_cents integer not null default 0,
  royalty_percentage numeric(5,2) not null default 0 check (royalty_percentage >= 0 and royalty_percentage <= 100),
  edition_number integer not null default 1,
  total_editions integer not null default 1,
  status text not null default 'minted' check (status in ('minted', 'listed', 'sold', 'transferred', 'burned')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_nfts_memorial on public.nfts using btree (memorial_id);
create index idx_nfts_creator on public.nfts using btree (creator_id);
create index idx_nfts_owner on public.nfts using btree (owner_id);
create index idx_nfts_status on public.nfts using btree (status);

-- NFT TRANSACTIONS
create table public.nft_transactions (
  id uuid primary key default uuid_generate_v4(),
  nft_id uuid not null references public.nfts(id) on delete cascade,
  from_user_id uuid references public.profiles(id) on delete set null,
  to_user_id uuid references public.profiles(id) on delete set null,
  transaction_type text not null check (transaction_type in ('mint', 'purchase', 'transfer', 'list', 'delist')),
  price_cents integer,
  transaction_hash text,
  created_at timestamptz not null default now()
);

create index idx_nft_tx_nft on public.nft_transactions using btree (nft_id);
create index idx_nft_tx_created on public.nft_transactions using btree (created_at desc);

-- TRIGGERS
create trigger set_nfts_updated_at
  before update on public.nfts
  for each row execute function public.handle_updated_at();

-- ROW LEVEL SECURITY
alter table public.nfts enable row level security;
alter table public.nft_transactions enable row level security;

-- NFTs: non-burned are public
create policy "Non-burned NFTs viewable by everyone"
  on public.nfts for select using (status != 'burned');

create policy "Creators can mint NFTs"
  on public.nfts for insert with check (auth.uid() = creator_id);

create policy "Owners can update own NFTs"
  on public.nfts for update using (auth.uid() = owner_id or auth.uid() = creator_id);

-- Transactions: public audit trail
create policy "NFT transactions viewable by everyone"
  on public.nft_transactions for select using (
    exists (select 1 from public.nfts where id = nft_id and status != 'burned')
  );

create policy "Authenticated users can create transactions"
  on public.nft_transactions for insert with check (auth.uid() is not null);

-- Storage
insert into storage.buckets (id, name, public) values ('nft-assets', 'nft-assets', true)
on conflict (id) do nothing;

create policy "Anyone can view NFT assets"
  on storage.objects for select using (bucket_id = 'nft-assets');

create policy "Authenticated users can upload NFT assets"
  on storage.objects for insert with check (bucket_id = 'nft-assets' and auth.role() = 'authenticated');

-- === 00009_live_rooms.sql ===
-- =============================================
-- LIVE ROOMS & STREAMING — Phase 3 Sprint 4
-- =============================================

-- LIVE ROOMS
create table public.live_rooms (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid references public.profiles(id) on delete cascade not null,
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  title text not null,
  description text,
  room_type text not null default 'audio' check (room_type in ('audio', 'video', 'stream')),
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended', 'cancelled')),
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz,
  max_participants integer,
  participant_count integer not null default 0,
  recording_url text,
  is_recorded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_live_rooms_memorial on public.live_rooms using btree (memorial_id);
create index idx_live_rooms_host on public.live_rooms using btree (host_id);
create index idx_live_rooms_status on public.live_rooms using btree (status);
create index idx_live_rooms_scheduled on public.live_rooms using btree (scheduled_at);

-- LIVE ROOM PARTICIPANTS
create table public.live_room_participants (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references public.live_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'listener' check (role in ('host', 'speaker', 'listener')),
  is_speaking boolean not null default false,
  is_muted boolean not null default true,
  hand_raised boolean not null default false,
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique(room_id, user_id)
);

create index idx_live_participants_room on public.live_room_participants using btree (room_id);
create index idx_live_participants_user on public.live_room_participants using btree (user_id);

-- TRIGGERS
create trigger set_live_rooms_updated_at
  before update on public.live_rooms
  for each row execute function public.handle_updated_at();

-- Helper RPCs for atomic participant count
create or replace function public.increment_participant_count(room_id_param uuid)
returns void as $$
begin
  update public.live_rooms
  set participant_count = participant_count + 1
  where id = room_id_param;
end;
$$ language plpgsql security definer;

create or replace function public.decrement_participant_count(room_id_param uuid)
returns void as $$
begin
  update public.live_rooms
  set participant_count = greatest(participant_count - 1, 0)
  where id = room_id_param;
end;
$$ language plpgsql security definer;

-- ROW LEVEL SECURITY
alter table public.live_rooms enable row level security;
alter table public.live_room_participants enable row level security;

-- Live rooms: public
create policy "Live rooms viewable by everyone"
  on public.live_rooms for select using (true);

create policy "Hosts can create live rooms"
  on public.live_rooms for insert with check (auth.uid() = host_id);

create policy "Hosts can update own rooms"
  on public.live_rooms for update using (auth.uid() = host_id);

-- Participants
create policy "Room participants viewable by everyone"
  on public.live_room_participants for select using (true);

create policy "Users can join rooms"
  on public.live_room_participants for insert with check (auth.uid() = user_id);

create policy "Users can update own participation"
  on public.live_room_participants for update using (auth.uid() = user_id);

-- Enable realtime for live rooms
alter publication supabase_realtime add table public.live_room_participants;

-- === 00010_memory_vaults.sql ===
-- Phase 4: Memory Vaults, Time Capsules & Legacy Letters
-- Migration: 00010_memory_vaults.sql

-- ============================================================
-- Memory Vault Items (Digital Memory Box per memorial)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('document', 'recipe', 'letter', 'audio_playlist', 'quote', 'photo_album', 'video', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- For text-based items (recipes, quotes, letters)
  media_url TEXT, -- For file-based items
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}', -- Flexible metadata (ingredients for recipes, attribution for quotes, etc.)
  is_private BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_vault_memorial ON memory_vault_items(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memory_vault_type ON memory_vault_items(item_type);
CREATE INDEX IF NOT EXISTS idx_memory_vault_uploaded_by ON memory_vault_items(uploaded_by);

ALTER TABLE memory_vault_items ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view public vault items" ON memory_vault_items
  FOR SELECT USING (is_private = false);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Memorial hosts can view all vault items" ON memory_vault_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_vault_items.memorial_id AND user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Memorial hosts can insert vault items" ON memory_vault_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_vault_items.memorial_id AND user_id = auth.uid())
    OR uploaded_by = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Uploader or host can update vault items" ON memory_vault_items
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_vault_items.memorial_id AND user_id = auth.uid() AND role = 'owner')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Uploader or host can delete vault items" ON memory_vault_items
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_vault_items.memorial_id AND user_id = auth.uid() AND role = 'owner')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Time Capsules (content that unlocks on future dates)
-- ============================================================
CREATE TABLE IF NOT EXISTS time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- The hidden message/content
  media_url TEXT, -- Optional media attachment
  unlock_date TIMESTAMPTZ NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  recipient_ids UUID[] DEFAULT '{}', -- Specific recipients, empty = all followers
  notify_on_unlock BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_capsules_memorial ON time_capsules(memorial_id);
CREATE INDEX IF NOT EXISTS idx_time_capsules_unlock_date ON time_capsules(unlock_date);
CREATE INDEX IF NOT EXISTS idx_time_capsules_created_by ON time_capsules(created_by);

ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view unlocked capsules" ON time_capsules
  FOR SELECT USING (is_unlocked = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Creator can view own capsules" ON time_capsules
  FOR SELECT USING (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Memorial hosts can view all capsules" ON time_capsules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = time_capsules.memorial_id AND user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can create capsules" ON time_capsules
  FOR INSERT WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Creator can update own capsules" ON time_capsules
  FOR UPDATE USING (created_by = auth.uid() AND is_unlocked = false);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Creator can delete own capsules" ON time_capsules
  FOR DELETE USING (created_by = auth.uid() AND is_unlocked = false);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Legacy Letters (delivered to specific people on specific dates)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id),
  memorial_id UUID REFERENCES memorials(id) ON DELETE SET NULL, -- Optional memorial association
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_user_id UUID REFERENCES profiles(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  delivery_date TIMESTAMPTZ NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'in_app' CHECK (delivery_type IN ('in_app', 'email', 'both')),
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legacy_letters_author ON legacy_letters(author_id);
CREATE INDEX IF NOT EXISTS idx_legacy_letters_recipient ON legacy_letters(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_letters_delivery_date ON legacy_letters(delivery_date);

ALTER TABLE legacy_letters ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Author can manage own letters" ON legacy_letters
  FOR ALL USING (author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Recipient can view delivered letters" ON legacy_letters
  FOR SELECT USING (recipient_user_id = auth.uid() AND is_delivered = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Scrapbook Pages (digital scrapbooking)
-- ============================================================
CREATE TABLE IF NOT EXISTS scrapbook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  page_number INTEGER NOT NULL DEFAULT 1,
  layout_data JSONB NOT NULL DEFAULT '{}', -- Positions, sizes, rotations of elements
  background_color TEXT DEFAULT '#FFFFFF',
  background_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(memorial_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_scrapbook_memorial ON scrapbook_pages(memorial_id);

ALTER TABLE scrapbook_pages ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view published pages" ON scrapbook_pages
  FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Memorial hosts can manage pages" ON scrapbook_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = scrapbook_pages.memorial_id AND user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Memorial QR Codes (physical-to-digital bridge)
-- ============================================================
CREATE TABLE IF NOT EXISTS memorial_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  code TEXT UNIQUE NOT NULL, -- Short unique code for QR
  label TEXT, -- e.g., "Headstone QR", "Urn Plaque"
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  scan_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_memorial ON memorial_qr_codes(memorial_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON memorial_qr_codes(code);

ALTER TABLE memorial_qr_codes ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view active QR codes" ON memorial_qr_codes
  FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Memorial hosts can manage QR codes" ON memorial_qr_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memorial_qr_codes.memorial_id AND user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Storage bucket for memory vault files
INSERT INTO storage.buckets (id, name, public) VALUES ('memory-vault', 'memory-vault', true) ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER handle_memory_vault_updated_at BEFORE UPDATE ON memory_vault_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_time_capsules_updated_at BEFORE UPDATE ON time_capsules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_legacy_letters_updated_at BEFORE UPDATE ON legacy_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_scrapbook_updated_at BEFORE UPDATE ON scrapbook_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- === 00011_family_trees.sql ===
-- Phase 4: Family Trees & Memorial Connections
-- Migration: 00011_family_trees.sql

-- ============================================================
-- Family Trees (connect memorials into lineages)
-- ============================================================
CREATE TABLE IF NOT EXISTS family_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_trees_created_by ON family_trees(created_by);

ALTER TABLE family_trees ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view public trees" ON family_trees
  FOR SELECT USING (is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Creator can view own trees" ON family_trees
  FOR SELECT USING (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can create trees" ON family_trees
  FOR INSERT WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Creator can update own trees" ON family_trees
  FOR UPDATE USING (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Creator can delete own trees" ON family_trees
  FOR DELETE USING (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Family Tree Members (nodes in the tree)
-- ============================================================
CREATE TABLE IF NOT EXISTS family_tree_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
  memorial_id UUID REFERENCES memorials(id) ON DELETE SET NULL, -- Link to existing memorial (optional)
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Link to living user (optional)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  date_of_death DATE,
  photo_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  bio TEXT,
  is_living BOOLEAN DEFAULT true,
  -- Position in tree visualization
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  generation_level INTEGER DEFAULT 0, -- 0 = root generation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tree_members_tree ON family_tree_members(tree_id);
CREATE INDEX IF NOT EXISTS idx_tree_members_memorial ON family_tree_members(memorial_id);
CREATE INDEX IF NOT EXISTS idx_tree_members_profile ON family_tree_members(profile_id);

ALTER TABLE family_tree_members ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view members of public trees" ON family_tree_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_trees WHERE id = family_tree_members.tree_id AND is_public = true)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Tree creator can manage members" ON family_tree_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM family_trees WHERE id = family_tree_members.tree_id AND created_by = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Family Tree Connections (edges between members)
-- ============================================================
CREATE TABLE IF NOT EXISTS family_tree_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES family_tree_members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES family_tree_members(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild',
    'aunt_uncle', 'niece_nephew', 'cousin', 'in_law', 'step_parent',
    'step_child', 'step_sibling', 'adopted', 'guardian', 'other'
  )),
  relationship_label TEXT, -- Custom label e.g., "Mother", "Husband"
  start_date DATE, -- Marriage date for spouse connections
  end_date DATE, -- Divorce date or end of relationship
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tree_id, from_member_id, to_member_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_tree_connections_tree ON family_tree_connections(tree_id);
CREATE INDEX IF NOT EXISTS idx_tree_connections_from ON family_tree_connections(from_member_id);
CREATE INDEX IF NOT EXISTS idx_tree_connections_to ON family_tree_connections(to_member_id);

ALTER TABLE family_tree_connections ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view connections of public trees" ON family_tree_connections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_trees WHERE id = family_tree_connections.tree_id AND is_public = true)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Tree creator can manage connections" ON family_tree_connections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM family_trees WHERE id = family_tree_connections.tree_id AND created_by = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Memory Prompts (AI-generated prompts for memory sharing)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('remember_when', 'on_this_day', 'seasonal', 'milestone', 'random', 'custom')),
  trigger_date DATE, -- For date-based prompts
  is_active BOOLEAN DEFAULT true,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_prompts_memorial ON memory_prompts(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memory_prompts_trigger ON memory_prompts(trigger_date);

ALTER TABLE memory_prompts ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view active prompts" ON memory_prompts
  FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Memorial hosts can manage prompts" ON memory_prompts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_prompts.memorial_id AND user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Memory Prompt Responses
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_prompt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES memory_prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_responses_prompt ON memory_prompt_responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_responses_user ON memory_prompt_responses(user_id);

ALTER TABLE memory_prompt_responses ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view responses" ON memory_prompt_responses
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can respond" ON memory_prompt_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can update own responses" ON memory_prompt_responses
  FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Sync response count
CREATE OR REPLACE FUNCTION sync_prompt_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE memory_prompts SET response_count = (
    SELECT COUNT(*) FROM memory_prompt_responses WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
  ) WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_prompt_responses AFTER INSERT OR DELETE ON memory_prompt_responses
  FOR EACH ROW EXECUTE FUNCTION sync_prompt_response_count();

-- Sync family tree member count
CREATE OR REPLACE FUNCTION sync_tree_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE family_trees SET member_count = (
    SELECT COUNT(*) FROM family_tree_members WHERE tree_id = COALESCE(NEW.tree_id, OLD.tree_id)
  ) WHERE id = COALESCE(NEW.tree_id, OLD.tree_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_tree_members AFTER INSERT OR DELETE ON family_tree_members
  FOR EACH ROW EXECUTE FUNCTION sync_tree_member_count();

-- Triggers for updated_at
CREATE TRIGGER handle_family_trees_updated_at BEFORE UPDATE ON family_trees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_tree_members_updated_at BEFORE UPDATE ON family_tree_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- === 00012_virtual_spaces.sql ===
-- Phase 4: Virtual Memorial Spaces & Advanced Social
-- Migration: 00012_virtual_spaces.sql

-- ============================================================
-- Virtual Spaces (AR/VR memorial rooms)
-- ============================================================
CREATE TABLE IF NOT EXISTS virtual_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  space_type TEXT NOT NULL DEFAULT 'memorial_room' CHECK (space_type IN (
    'memorial_room', 'garden', 'chapel', 'gravesite', 'beach', 'forest', 'custom'
  )),
  theme_data JSONB DEFAULT '{}', -- Colors, lighting, skybox, etc.
  background_music_url TEXT,
  is_public BOOLEAN DEFAULT true,
  visitor_count INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_virtual_spaces_memorial ON virtual_spaces(memorial_id);

ALTER TABLE virtual_spaces ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view public spaces" ON virtual_spaces
  FOR SELECT USING (is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Memorial hosts can manage spaces" ON virtual_spaces
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = virtual_spaces.memorial_id AND user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Virtual Space Items (objects placed in 3D space)
-- ============================================================
CREATE TABLE IF NOT EXISTS virtual_space_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES virtual_spaces(id) ON DELETE CASCADE,
  placed_by UUID NOT NULL REFERENCES profiles(id),
  item_type TEXT NOT NULL CHECK (item_type IN (
    'candle', 'flower', 'photo', 'wreath', 'plant', 'teddy_bear',
    'cross', 'star_of_david', 'crescent', 'dove', 'butterfly',
    'custom_3d', 'text_plaque', 'audio_clip', 'video_frame'
  )),
  -- 3D positioning
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  position_z DOUBLE PRECISION DEFAULT 0,
  rotation_x DOUBLE PRECISION DEFAULT 0,
  rotation_y DOUBLE PRECISION DEFAULT 0,
  rotation_z DOUBLE PRECISION DEFAULT 0,
  scale DOUBLE PRECISION DEFAULT 1.0,
  -- Content
  media_url TEXT, -- For photos, videos, custom 3D models
  text_content TEXT, -- For text plaques
  message TEXT, -- Personal message attached to item
  -- Properties
  color TEXT,
  animation TEXT, -- 'flicker' for candles, 'sway' for flowers, etc.
  is_permanent BOOLEAN DEFAULT false, -- Permanent items vs temporary (e.g., birthday flowers)
  expires_at TIMESTAMPTZ,
  ribbon_cost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_space_items_space ON virtual_space_items(space_id);
CREATE INDEX IF NOT EXISTS idx_space_items_placed_by ON virtual_space_items(placed_by);

ALTER TABLE virtual_space_items ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view items in public spaces" ON virtual_space_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM virtual_spaces WHERE id = virtual_space_items.space_id AND is_public = true)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can place items" ON virtual_space_items
  FOR INSERT WITH CHECK (auth.uid() = placed_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Item placer or space host can manage" ON virtual_space_items
  FOR UPDATE USING (
    placed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM virtual_spaces vs
      JOIN memorial_hosts mh ON mh.memorial_id = vs.memorial_id
      WHERE vs.id = virtual_space_items.space_id AND mh.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Item placer or space host can delete" ON virtual_space_items
  FOR DELETE USING (
    placed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM virtual_spaces vs
      JOIN memorial_hosts mh ON mh.memorial_id = vs.memorial_id
      WHERE vs.id = virtual_space_items.space_id AND mh.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Memorial Memory Streaks (engagement tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_visits INTEGER DEFAULT 0,
  total_candles_lit INTEGER DEFAULT 0,
  total_memories_shared INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, memorial_id)
);

CREATE INDEX IF NOT EXISTS idx_memory_streaks_user ON memory_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_streaks_memorial ON memory_streaks(memorial_id);

ALTER TABLE memory_streaks ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Users can view own streaks" ON memory_streaks
  FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can manage own streaks" ON memory_streaks
  FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Seasonal Decorations (time-limited virtual decorations)
-- ============================================================
CREATE TABLE IF NOT EXISTS seasonal_decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  decoration_type TEXT NOT NULL CHECK (decoration_type IN (
    'christmas', 'easter', 'valentines', 'mothers_day', 'fathers_day',
    'memorial_day', 'veterans_day', 'halloween', 'thanksgiving',
    'new_year', 'birthday', 'anniversary', 'custom'
  )),
  image_url TEXT NOT NULL,
  preview_url TEXT,
  ribbon_cost INTEGER DEFAULT 0, -- 0 = free
  is_premium BOOLEAN DEFAULT false,
  available_from TIMESTAMPTZ NOT NULL,
  available_until TIMESTAMPTZ NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seasonal_decorations ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view available decorations" ON seasonal_decorations
  FOR SELECT USING (
    now() BETWEEN available_from AND available_until
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Applied Decorations (decorations applied to memorials)
-- ============================================================
CREATE TABLE IF NOT EXISTS applied_decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  decoration_id UUID NOT NULL REFERENCES seasonal_decorations(id),
  applied_by UUID NOT NULL REFERENCES profiles(id),
  applied_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- When the seasonal period ends
  UNIQUE(memorial_id, decoration_id, applied_by)
);

CREATE INDEX IF NOT EXISTS idx_applied_decorations_memorial ON applied_decorations(memorial_id);

ALTER TABLE applied_decorations ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view applied decorations" ON applied_decorations
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can apply decorations" ON applied_decorations
  FOR INSERT WITH CHECK (auth.uid() = applied_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Sync item count on virtual spaces
CREATE OR REPLACE FUNCTION sync_space_item_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE virtual_spaces SET item_count = (
    SELECT COUNT(*) FROM virtual_space_items WHERE space_id = COALESCE(NEW.space_id, OLD.space_id)
  ) WHERE id = COALESCE(NEW.space_id, OLD.space_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_space_items AFTER INSERT OR DELETE ON virtual_space_items
  FOR EACH ROW EXECUTE FUNCTION sync_space_item_count();

-- Triggers for updated_at
CREATE TRIGGER handle_virtual_spaces_updated_at BEFORE UPDATE ON virtual_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_memory_streaks_updated_at BEFORE UPDATE ON memory_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- === 00013_seed_sample_content.sql ===
-- ============================================================================
-- Phase 4B: Seed Sample Content for Content-First UX
-- Populates the app with realistic, emotionally compelling sample data
-- so the app feels alive from first launch for guest users.
-- ============================================================================

-- Create a system user for sample content
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@eterrn.app',
  '{"username": "eterrn_team", "display_name": "ǝterrn Team"}',
  NOW(), NOW(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create 5 sample contributor profiles
INSERT INTO profiles (id, username, display_name, bio, ribbon_balance, is_verified) VALUES
  ('00000000-0000-0000-0000-000000000001', 'foreverr_team', 'Foreverr Team', 'The official Foreverr team account', 1000, true),
  ('00000000-0000-0000-0000-000000000010', 'sarah_t', 'Sarah Thompson', 'Remembering those we love, one tribute at a time', 150, false),
  ('00000000-0000-0000-0000-000000000011', 'mike_r', 'Michael Rivera', 'Proud son, keeping memories alive', 200, false),
  ('00000000-0000-0000-0000-000000000012', 'priya_o', 'Priya Okafor', 'Community builder. Every life deserves to be remembered.', 175, false),
  ('00000000-0000-0000-0000-000000000013', 'jenny_c', 'Jennifer Chen', 'Music teacher. Jimmy''s mom. Forever grateful.', 250, false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 5 Sample Memorials
-- ============================================================================

INSERT INTO memorials (
  id, created_by, first_name, last_name, date_of_birth, date_of_death,
  biography, obituary, privacy, slug,
  follower_count, tribute_count
) VALUES
-- 1. Eleanor Grace Thompson — Beloved grandmother, teacher
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Eleanor', 'Thompson',
  '1938-03-15', '2023-11-22',
  'Eleanor Grace Thompson was a beacon of warmth and wisdom for everyone who knew her. Born in a small town in Vermont, she grew up with a love for learning that she carried throughout her 85 years. She spent 40 years as an elementary school teacher, touching thousands of young lives with her gentle patience and infectious enthusiasm for reading. Her kitchen was always filled with the aroma of fresh-baked cookies, and her garden was the pride of the neighborhood. Eleanor believed that every child could shine if given enough love, and she lived that belief every single day.',
  'Eleanor Grace Thompson, 85, passed peacefully surrounded by family on November 22, 2023. A devoted wife, mother of three, grandmother of seven, and beloved teacher, Eleanor spent her life nurturing others. She is survived by her children Robert, Margaret, and Susan, and her seven grandchildren who were the light of her life.',
  'public', 'eleanor-thompson',
  47, 12
),
-- 2. Marcus James Rivera — Young father, firefighter
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Marcus', 'Rivera',
  '1985-07-04', '2024-02-14',
  'Marcus James Rivera was a hero in every sense of the word. As a firefighter for 12 years in Station 7, he ran toward danger so others could run to safety. But to his family, Marcus was so much more — he was the dad who never missed a soccer game, the husband who left love notes in lunchboxes, and the friend who would drop everything to help. His laugh could fill an entire room, and his bear hugs made everyone feel safe. Marcus lived by a simple creed: show up, be brave, love hard.',
  'Marcus James Rivera, 38, made the ultimate sacrifice on February 14, 2024, responding to a four-alarm fire in downtown. A decorated firefighter, devoted father to Sofia (8) and Diego (5), and beloved husband to Maria. His courage saved three families that night. He is remembered as a true hero by all who knew him.',
  'public', 'marcus-rivera',
  89, 24
),
-- 3. Dr. Amara Okafor — Community leader, physician
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Amara', 'Okafor',
  '1950-12-01', '2022-08-19',
  'Dr. Amara Okafor dedicated her life to healing — not just bodies, but communities. Born in Lagos, Nigeria, she immigrated to the United States at 22 with a dream and $200. She put herself through medical school, became one of the first Black female physicians at City General Hospital, and went on to open a free clinic that served over 10,000 patients in its first decade. Beyond medicine, Amara mentored dozens of young women pursuing careers in science, organized community health fairs, and quietly paid for three students'' college educations. She often said, "When you heal one person, you heal a family. When you heal a family, you heal a community."',
  'Dr. Amara Okafor, 71, beloved physician, community pillar, and mentor, passed away August 19, 2022. Born in Lagos, Nigeria, she built a legacy of healing and service in her adopted home. Survived by her husband David, children Nkechi, Emeka, and Chidera, and a community that will forever carry her mission forward.',
  'public', 'amara-okafor',
  63, 18
),
-- 4. James "Jimmy" Chen — Teenager, musician
(
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'James', 'Chen',
  '2005-09-20', '2023-06-03',
  'James "Jimmy" Chen had a gift for making music that could make you feel things you didn''t have words for. At just 17, he could play guitar, piano, drums, and was teaching himself violin. His YouTube covers had thousands of views, but what he loved most was playing acoustic sets at the local coffee shop where old regulars would request their favorites. Jimmy dreamed of scoring films one day — he said music was the invisible thread that connected all stories. He was kind beyond his years, always the first to stand up for classmates being bullied, and the one who could make anyone laugh on their worst day.',
  'James "Jimmy" Chen, 17, of Millbrook, passed away June 3, 2023. A gifted musician, straight-A student, and gentle soul, Jimmy touched countless lives with his music and kindness. Survived by his parents Lin and David Chen, his sister Lily, and the entire Millbrook High School community that loved him dearly.',
  'public', 'jimmy-chen',
  112, 31
),
-- 5. Rose Marie Williams — Matriarch, WWII era
(
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Rose', 'Williams',
  '1932-05-08', '2024-01-15',
  'Rose Marie Williams lived through history and made plenty of her own. Born during the Great Depression, she learned early that tough times required tougher people — and she was the toughest. She worked in a factory during WWII while barely a teenager, married her sweetheart Harold when he returned from Europe in 1946, and together they built a family of five children, twelve grandchildren, and eight great-grandchildren. Rose''s Sunday dinners were legendary — she could feed thirty people from a kitchen the size of a closet. She knitted blankets for every baby born into the family, told stories that could make you cry and laugh in the same breath, and never let anyone leave her house without a full stomach and a warmer heart.',
  'Rose Marie Williams, 91, matriarch of the Williams family, passed peacefully on January 15, 2024. Rose lived a life full of love, resilience, and laughter. Predeceased by her beloved husband Harold (1998). Survived by her five children, twelve grandchildren, and eight great-grandchildren. Her legacy of strength and love endures in all who knew her.',
  'public', 'rose-williams',
  55, 15
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- Memorial Hosts
-- ============================================================================

INSERT INTO memorial_hosts (memorial_id, user_id, role, relationship) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Sample Tributes (20+ across all memorials)
-- ============================================================================

INSERT INTO tributes (id, memorial_id, author_id, type, content, ribbon_type, ribbon_count, like_count, comment_count, created_at) VALUES

-- Eleanor Thompson tributes
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'text',
 'Grandma Eleanor, you taught me that every day is a chance to be kind. I still use the recipe you gave me for your famous chocolate chip cookies, and every time the kitchen fills with that smell, I feel you right here with me. I miss our Sunday phone calls more than words can say.',
 'gold', 3, 8, 2, NOW() - INTERVAL '30 days'),

('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'text',
 'Mrs. Thompson was my third-grade teacher and she changed my life. I was struggling with reading and she stayed after school with me every day for three months until I could read chapter books. Because of her patience, I eventually became a teacher myself. Thank you, Mrs. Thompson, for believing in me.',
 'silver', 1, 12, 3, NOW() - INTERVAL '25 days'),

('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'text',
 'Eleanor was my neighbor for 30 years. She always brought soup when someone was sick and flowers when someone was celebrating. The neighborhood feels emptier without her smile at the garden fence.',
 'purple', 2, 6, 1, NOW() - INTERVAL '20 days'),

-- Marcus Rivera tributes
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', 'text',
 'My brother, my best friend, my hero. You ran into that building without a second thought because that is who you were. Sofia drew a picture of you in your gear yesterday and said "Daddy is keeping the angels safe now." I promise you, Maria and the kids will never want for anything. We will make you proud every single day.',
 'eternal', 5, 24, 8, NOW() - INTERVAL '15 days'),

('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'text',
 'Captain Rivera trained me when I was a rookie. He used to say "Fear is fine. Freezing is not." That stuck with me through every call. He didn''t just teach us how to fight fires — he taught us how to be brave. Rest easy, Captain.',
 'gold', 3, 15, 4, NOW() - INTERVAL '14 days'),

('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', 'text',
 'Marcus coached my son''s soccer team. Every kid on that team felt like they mattered. He had this way of seeing the best in everyone. The whole community is mourning. You are a true hero, Marcus.',
 'silver', 1, 9, 2, NOW() - INTERVAL '10 days'),

('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013', 'text',
 'I was one of the families Marcus saved that night. My children are alive because of his courage. There are no words big enough to express our gratitude. We light a candle for him every night.',
 'crystal', 4, 31, 6, NOW() - INTERVAL '8 days'),

-- Dr. Amara Okafor tributes
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'text',
 'Dr. Okafor delivered both of my children and treated my mother for years. She remembered every patient''s name, every child''s birthday. When we couldn''t afford medication, she quietly made it appear. She wasn''t just a doctor — she was family to this whole neighborhood.',
 'gold', 3, 11, 3, NOW() - INTERVAL '60 days'),

('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'text',
 'Mama Amara mentored me through medical school. She paid for my textbooks when I couldn''t afford them and never told a soul. I found out years later from her husband. I am the doctor I am today because she invested in me. Her clinic will continue serving our community — that is my promise.',
 'eternal', 5, 18, 5, NOW() - INTERVAL '55 days'),

('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', 'text',
 'Dr. Okafor spoke at our school about pursuing your dreams no matter what obstacles you face. Her story of immigrating with $200 and becoming a doctor inspired me to go to college. She proved that determination can change everything.',
 'silver', 1, 7, 1, NOW() - INTERVAL '50 days'),

-- Jimmy Chen tributes
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013', 'text',
 'My beautiful boy. You came into this world singing and you left it too soon. Your music lives on in every note that plays in this house. Lily plays your guitar every day now — she says it helps her feel close to you. We play your recordings at dinner and pretend you are just in the other room. I love you beyond the stars, Jimmy. Save me a seat at your concert.',
 'eternal', 5, 42, 11, NOW() - INTERVAL '90 days'),

('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'text',
 'Jimmy was my best friend since kindergarten. He always had his earbuds in, humming something no one else could hear yet. I used to tease him about it but now I''d give anything to hear him hum one more time. We started a scholarship in his name at school for music students. Keep playing up there, bro.',
 'gold', 3, 19, 5, NOW() - INTERVAL '85 days'),

('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000011', 'text',
 'I own the coffee shop where Jimmy used to play. Every Friday night, he''d set up in the corner with his guitar and the whole place would go quiet. Regulars would come just to hear him. We still keep his spot open on Fridays. Sometimes when the evening light hits just right, I swear I can hear his music.',
 'purple', 2, 14, 3, NOW() - INTERVAL '80 days'),

('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', 'text',
 'Jimmy stood up for me when I was being bullied in 9th grade. He didn''t even know me that well, he just saw something wrong and did something about it. That takes real courage at that age. He made high school bearable for so many of us.',
 'silver', 1, 10, 2, NOW() - INTERVAL '75 days'),

-- Rose Williams tributes
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'text',
 'Great-Grandma Rose, thank you for the blanket you knitted for my baby. She sleeps with it every night. You put love into every stitch and we feel it. I wish you could have met her — she has your eyes and your stubbornness. We named her middle name Rose.',
 'gold', 3, 13, 4, NOW() - INTERVAL '5 days'),

('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011', 'text',
 'Mom, your Sunday dinners held this family together. Every argument was settled over your mashed potatoes, every celebration toasted with your lemonade. Now when we gather, we cook your recipes and tell your stories. The table feels bigger without you, but your love fills every empty chair.',
 'eternal', 5, 16, 6, NOW() - INTERVAL '3 days'),

('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000012', 'text',
 'Rose was the strongest woman I ever knew. She worked in a factory during the war at 12 years old, raised five kids, survived losing her husband, and still had a joke for every occasion. She once told me, "Life doesn''t get easier — you just get tougher." I think about that every single day.',
 'purple', 2, 9, 2, NOW() - INTERVAL '2 days'),

('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000013', 'text',
 'Grandma Rose taught me to knit when I was 7. I''m 35 now and I still use the same stitches she taught me. Every time I start a new project, I can hear her voice saying "slow and steady, dear." She had endless patience and even more love.',
 'silver', 1, 7, 1, NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- Sample Reactions (50+ across tributes and memorials)
-- ============================================================================

INSERT INTO reactions (id, user_id, target_type, target_id, reaction_type, created_at)
SELECT
  gen_random_uuid(),
  user_id::uuid,
  'tribute',
  tribute_id::uuid,
  reaction_type,
  NOW() - (random() * INTERVAL '30 days')
FROM (VALUES
  -- Candles
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', 'candle'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', 'candle'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000004', 'candle'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000004', 'candle'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000004', 'candle'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000007', 'candle'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000011', 'candle'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000011', 'candle'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000011', 'candle'),
  -- Hearts
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000005', 'heart'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000005', 'heart'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000005', 'heart'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000008', 'heart'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000008', 'heart'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'heart'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000016', 'heart'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000016', 'heart'),
  -- Flowers
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', 'flower'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', 'flower'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000003', 'flower'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000003', 'flower'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000015', 'flower'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000015', 'flower'),
  -- Prayers
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000006', 'prayer'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000006', 'prayer'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000006', 'prayer'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000009', 'prayer'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000009', 'prayer'),
  -- Doves
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000012', 'dove'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000012', 'dove'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000017', 'dove'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000017', 'dove'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000013', 'dove'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000013', 'dove')
) AS t(user_id, tribute_id, reaction_type)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Sample Followers (so memorials show follower counts)
-- ============================================================================

INSERT INTO followers (memorial_id, user_id) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Sample Events
-- ============================================================================

INSERT INTO events (id, memorial_id, created_by, title, description, type, start_date, location) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Eleanor''s 1st Anniversary Remembrance',
  'Join us as we gather to celebrate Eleanor''s life and legacy. We''ll share stories, look at photos, and enjoy her famous recipes together. All are welcome.',
  'anniversary',
  '2024-11-22 14:00:00+00',
  'Community Garden, 45 Maple Street, Burlington, VT'
),
(
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Candle Lighting for Marcus',
  'Station 7 is hosting a community candle lighting ceremony in honor of Captain Marcus Rivera. We invite all who knew him to come share a memory and light a candle for our fallen hero.',
  'vigil',
  '2025-02-14 18:00:00+00',
  'Fire Station 7, 200 Main Street'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- Sample Memory Prompts
-- ============================================================================

INSERT INTO memory_prompts (id, memorial_id, prompt_text, prompt_type, response_count) VALUES
(
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'What is your favorite memory of Eleanor?',
  'remember_when', 3
),
(
  '40000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000004',
  'What song reminds you most of Jimmy?',
  'custom', 2
),
(
  '40000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000005',
  'What was your favorite dish from Rose''s Sunday dinners?',
  'custom', 4
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- Sample Time Capsule (locked, opens in 2027)
-- ============================================================================

INSERT INTO time_capsules (id, memorial_id, created_by, title, content, unlock_date, is_unlocked) VALUES
(
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000013',
  'Letters to Jimmy - To Open on His 22nd Birthday',
  'A collection of letters, voice notes, and photos from friends and family, written for Jimmy on what would have been his 22nd birthday.',
  '2027-09-20',
  false
)
ON CONFLICT (id) DO NOTHING;

