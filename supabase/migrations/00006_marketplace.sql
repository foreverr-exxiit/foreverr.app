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
