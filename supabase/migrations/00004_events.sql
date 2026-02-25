-- =============================================
-- EVENTS SYSTEM — Phase 2 Sprint 3
-- =============================================

-- EVENTS
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null not null,
  title text not null,
  description text,
  type text not null default 'ceremony' check (type in ('ceremony', 'celebration', 'gathering', 'vigil', 'anniversary', 'birthday', 'fundraiser', 'other')),
  location text,
  location_url text,
  is_virtual boolean not null default false,
  virtual_link text,
  start_date timestamptz not null,
  end_date timestamptz,
  cover_image_url text,
  rsvp_count integer not null default 0,
  max_attendees integer,
  is_public boolean not null default true,
  status text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_events_memorial on public.events using btree (memorial_id);
create index idx_events_start_date on public.events using btree (start_date);
create index idx_events_status on public.events using btree (status);

-- EVENT RSVPs
create table public.event_rsvps (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'going' check (status in ('going', 'maybe', 'not_going')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create index idx_event_rsvps_event on public.event_rsvps using btree (event_id);
create index idx_event_rsvps_user on public.event_rsvps using btree (user_id);

-- IMPORTANT DATES (auto-created birthdays, anniversaries, etc.)
create table public.important_dates (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  type text not null check (type in ('birthday', 'death_anniversary', 'custom')),
  title text not null,
  date date not null,
  recurs_annually boolean not null default true,
  notify_followers boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_important_dates_memorial on public.important_dates using btree (memorial_id);
create index idx_important_dates_date on public.important_dates using btree (date);

-- TRIGGERS

create trigger set_events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

create trigger set_event_rsvps_updated_at
  before update on public.event_rsvps
  for each row execute function public.handle_updated_at();

-- Sync RSVP count
create or replace function public.sync_rsvp_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.status = 'going' or new.status = 'maybe' then
      update public.events set rsvp_count = rsvp_count + 1 where id = new.event_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.status = 'going' or old.status = 'maybe' then
      update public.events set rsvp_count = rsvp_count - 1 where id = old.event_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    if (old.status in ('going', 'maybe')) and (new.status = 'not_going') then
      update public.events set rsvp_count = rsvp_count - 1 where id = new.event_id;
    elsif (old.status = 'not_going') and (new.status in ('going', 'maybe')) then
      update public.events set rsvp_count = rsvp_count + 1 where id = new.event_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger sync_rsvp_count_trigger
  after insert or update or delete on public.event_rsvps
  for each row execute function public.sync_rsvp_count();

-- Auto-create important dates from memorial birth/death dates
create or replace function public.auto_create_important_dates()
returns trigger as $$
begin
  if new.status = 'active' and (old.status is null or old.status != 'active') then
    -- Birthday
    if new.date_of_birth is not null then
      insert into public.important_dates (memorial_id, type, title, date)
      values (new.id, 'birthday', new.first_name || '''s Birthday', new.date_of_birth)
      on conflict do nothing;
    end if;
    -- Death anniversary
    if new.date_of_death is not null then
      insert into public.important_dates (memorial_id, type, title, date)
      values (new.id, 'death_anniversary', 'Remembrance Day - ' || new.first_name, new.date_of_death)
      on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger auto_create_important_dates_trigger
  after insert or update on public.memorials
  for each row execute function public.auto_create_important_dates();

-- ROW LEVEL SECURITY
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.important_dates enable row level security;

-- Events: public events visible to all, private to memorial members
create policy "Public events are viewable by everyone"
  on public.events for select using (
    is_public = true or
    created_by = auth.uid() or
    exists (select 1 from public.memorial_hosts where memorial_id = events.memorial_id and user_id = auth.uid())
  );

create policy "Hosts can create events"
  on public.events for insert with check (
    auth.uid() = created_by and
    exists (select 1 from public.memorial_hosts where memorial_id = events.memorial_id and user_id = auth.uid())
  );

create policy "Creators can update events"
  on public.events for update using (auth.uid() = created_by);

-- RSVPs
create policy "RSVPs are viewable on accessible events"
  on public.event_rsvps for select using (
    exists (select 1 from public.events where id = event_id and (is_public = true or created_by = auth.uid()))
  );

create policy "Users can RSVP"
  on public.event_rsvps for insert with check (auth.uid() = user_id);

create policy "Users can update own RSVP"
  on public.event_rsvps for update using (auth.uid() = user_id);

create policy "Users can delete own RSVP"
  on public.event_rsvps for delete using (auth.uid() = user_id);

-- Important dates
create policy "Important dates viewable on public memorials"
  on public.important_dates for select using (
    exists (select 1 from public.memorials where id = memorial_id and (privacy = 'public' or created_by = auth.uid()))
  );

create policy "Hosts can manage important dates"
  on public.important_dates for insert with check (
    exists (select 1 from public.memorial_hosts where memorial_id = important_dates.memorial_id and user_id = auth.uid())
  );
