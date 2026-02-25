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
