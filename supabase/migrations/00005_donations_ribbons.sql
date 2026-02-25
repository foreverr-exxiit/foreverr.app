-- =============================================
-- DONATIONS & RIBBON ECONOMY — Phase 2 Sprint 4
-- =============================================

-- FUNDRAISING CAMPAIGNS
create table public.fundraising_campaigns (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null not null,
  title text not null,
  description text,
  goal_cents integer not null default 0,
  raised_cents integer not null default 0,
  currency text not null default 'usd',
  beneficiary_name text,
  beneficiary_type text check (beneficiary_type in ('charity', 'family', 'funeral_costs', 'scholarship', 'other')),
  cover_image_url text,
  is_active boolean not null default true,
  donor_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_campaigns_memorial on public.fundraising_campaigns using btree (memorial_id);

-- DONATIONS
create table public.donations (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.fundraising_campaigns(id) on delete cascade not null,
  donor_id uuid references public.profiles(id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'usd',
  stripe_payment_intent_id text,
  message text,
  is_anonymous boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create index idx_donations_campaign on public.donations using btree (campaign_id);
create index idx_donations_donor on public.donations using btree (donor_id);

-- RIBBON PACKAGES (in-app purchase items)
create table public.ribbon_packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  ribbon_amount integer not null,
  price_cents integer not null,
  currency text not null default 'usd',
  store_product_id text, -- RevenueCat/App Store product ID
  is_active boolean not null default true,
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- DAILY REWARDS
create table public.daily_rewards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  reward_date date not null default current_date,
  ribbons_earned integer not null default 5,
  streak_day integer not null default 1,
  created_at timestamptz not null default now(),
  unique(user_id, reward_date)
);

create index idx_daily_rewards_user on public.daily_rewards using btree (user_id, reward_date desc);

-- TRIGGERS

create trigger set_campaigns_updated_at
  before update on public.fundraising_campaigns
  for each row execute function public.handle_updated_at();

-- Sync campaign totals when donation completed
create or replace function public.sync_campaign_totals()
returns trigger as $$
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    update public.fundraising_campaigns
    set raised_cents = raised_cents + new.amount_cents,
        donor_count = donor_count + 1
    where id = new.campaign_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger sync_campaign_totals_trigger
  after insert or update on public.donations
  for each row execute function public.sync_campaign_totals();

-- ROW LEVEL SECURITY
alter table public.fundraising_campaigns enable row level security;
alter table public.donations enable row level security;
alter table public.ribbon_packages enable row level security;
alter table public.daily_rewards enable row level security;

-- Campaigns
create policy "Campaigns viewable on accessible memorials"
  on public.fundraising_campaigns for select using (
    exists (select 1 from public.memorials where id = memorial_id and (privacy = 'public' or created_by = auth.uid()))
  );

create policy "Hosts can create campaigns"
  on public.fundraising_campaigns for insert with check (
    auth.uid() = created_by and
    exists (select 1 from public.memorial_hosts where memorial_id = fundraising_campaigns.memorial_id and user_id = auth.uid())
  );

create policy "Creators can update campaigns"
  on public.fundraising_campaigns for update using (auth.uid() = created_by);

-- Donations
create policy "Donations viewable on campaigns"
  on public.donations for select using (
    exists (select 1 from public.fundraising_campaigns where id = campaign_id and is_active = true)
  );

create policy "Authenticated users can donate"
  on public.donations for insert with check (auth.uid() = donor_id or donor_id is null);

-- Ribbon packages
create policy "Ribbon packages viewable by everyone"
  on public.ribbon_packages for select using (is_active = true);

-- Daily rewards
create policy "Users can view own daily rewards"
  on public.daily_rewards for select using (auth.uid() = user_id);

create policy "Users can claim daily rewards"
  on public.daily_rewards for insert with check (auth.uid() = user_id);

-- SEED DATA: Ribbon packages
insert into public.ribbon_packages (name, description, ribbon_amount, price_cents, is_popular, sort_order) values
  ('Starter', '50 ribbons to get started', 50, 99, false, 1),
  ('Popular', '200 ribbons — best value', 200, 299, true, 2),
  ('Premium', '500 ribbons for dedicated supporters', 500, 599, false, 3),
  ('Patron', '1500 ribbons for true patrons', 1500, 1499, false, 4);

-- SEED DATA: Gift catalog items
insert into public.gift_catalog (category, name, description, image_url, ribbon_cost, sort_order) values
  ('candle', 'Eternal Flame', 'A beautiful virtual candle', 'https://placeholder.co/candle.png', 5, 1),
  ('candle', 'Peace Candle', 'Lit with thoughts of peace', 'https://placeholder.co/peace-candle.png', 10, 2),
  ('flower', 'White Rose', 'Symbol of purity and remembrance', 'https://placeholder.co/white-rose.png', 8, 3),
  ('flower', 'Lily Bouquet', 'A gentle lily arrangement', 'https://placeholder.co/lily.png', 15, 4),
  ('plant', 'Remembrance Tree', 'A lasting tribute tree', 'https://placeholder.co/tree.png', 25, 5),
  ('sympathy_card', 'Thinking of You', 'Heartfelt sympathy card', 'https://placeholder.co/card.png', 10, 6),
  ('wreath', 'Memorial Wreath', 'Traditional remembrance wreath', 'https://placeholder.co/wreath.png', 30, 7),
  ('ribbon_bouquet', 'Ribbon Bouquet', 'A colorful ribbon arrangement', 'https://placeholder.co/ribbon-bouquet.png', 20, 8);
