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
