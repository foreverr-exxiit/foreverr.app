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
