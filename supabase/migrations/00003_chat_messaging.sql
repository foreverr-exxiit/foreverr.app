-- =============================================
-- CHAT & MESSAGING — Phase 2 Sprint 2
-- =============================================

-- CHAT ROOMS
create table public.chat_rooms (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade,
  type text not null default 'memorial' check (type in ('memorial', 'direct')),
  name text,
  last_message_text text,
  last_message_at timestamptz,
  last_message_by uuid references public.profiles(id),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_chat_rooms_memorial on public.chat_rooms using btree (memorial_id);
create index idx_chat_rooms_last_message on public.chat_rooms using btree (last_message_at desc nulls last);

-- CHAT MEMBERS
create table public.chat_members (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  last_read_at timestamptz not null default now(),
  is_muted boolean not null default false,
  joined_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create index idx_chat_members_user on public.chat_members using btree (user_id);
create index idx_chat_members_room on public.chat_members using btree (room_id);

-- MESSAGES
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null not null,
  content text,
  type text not null default 'text' check (type in ('text', 'image', 'voice', 'system', 'poll')),
  media_url text,
  reply_to_id uuid references public.messages(id) on delete set null,
  poll_data jsonb,
  is_edited boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_messages_room on public.messages using btree (room_id, created_at desc);
create index idx_messages_sender on public.messages using btree (sender_id);

-- TRIGGERS

-- Auto-update updated_at for chat tables
create trigger set_chat_rooms_updated_at
  before update on public.chat_rooms
  for each row execute function public.handle_updated_at();

create trigger set_messages_updated_at
  before update on public.messages
  for each row execute function public.handle_updated_at();

-- Sync last_message on room when new message sent
create or replace function public.sync_last_message()
returns trigger as $$
begin
  update public.chat_rooms
  set last_message_text = case
        when new.type = 'image' then '📷 Photo'
        when new.type = 'voice' then '🎤 Voice message'
        when new.type = 'poll' then '📊 Poll'
        else left(new.content, 100)
      end,
      last_message_at = new.created_at,
      last_message_by = new.sender_id
  where id = new.room_id;
  return new;
end;
$$ language plpgsql;

create trigger sync_last_message_trigger
  after insert on public.messages
  for each row execute function public.sync_last_message();

-- Auto-create memorial group chat when memorial is activated
create or replace function public.auto_create_memorial_chat()
returns trigger as $$
declare
  room_id uuid;
begin
  if new.status = 'active' and (old.status is null or old.status != 'active') then
    insert into public.chat_rooms (memorial_id, type, name)
    values (new.id, 'memorial', new.first_name || ' ' || new.last_name || ' Memorial')
    returning id into room_id;

    -- Add creator as admin
    if new.created_by is not null then
      insert into public.chat_members (room_id, user_id, role)
      values (room_id, new.created_by, 'admin');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger auto_create_memorial_chat_trigger
  after insert or update on public.memorials
  for each row execute function public.auto_create_memorial_chat();

-- ROW LEVEL SECURITY
alter table public.chat_rooms enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;

-- Chat rooms: members can see their rooms
create policy "Members can view their chat rooms"
  on public.chat_rooms for select using (
    exists (select 1 from public.chat_members where room_id = id and user_id = auth.uid())
  );

create policy "Authenticated users can create chat rooms"
  on public.chat_rooms for insert with check (auth.role() = 'authenticated');

create policy "Admins can update chat rooms"
  on public.chat_rooms for update using (
    exists (select 1 from public.chat_members where room_id = id and user_id = auth.uid() and role = 'admin')
  );

-- Chat members: visible to room members
create policy "Room members can view members"
  on public.chat_members for select using (
    exists (select 1 from public.chat_members cm where cm.room_id = chat_members.room_id and cm.user_id = auth.uid())
  );

create policy "Admins can add members"
  on public.chat_members for insert with check (
    exists (select 1 from public.chat_members where room_id = chat_members.room_id and user_id = auth.uid() and role = 'admin')
    or user_id = auth.uid()
  );

create policy "Members can update own membership"
  on public.chat_members for update using (user_id = auth.uid());

-- Messages: visible to room members
create policy "Room members can view messages"
  on public.messages for select using (
    exists (select 1 from public.chat_members where room_id = messages.room_id and user_id = auth.uid())
  );

create policy "Members can send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id and
    exists (select 1 from public.chat_members where room_id = messages.room_id and user_id = auth.uid())
  );

create policy "Authors can update own messages"
  on public.messages for update using (auth.uid() = sender_id);

-- STORAGE
insert into storage.buckets (id, name, public) values ('chat-media', 'chat-media', false);

create policy "Chat members can view chat media"
  on storage.objects for select using (bucket_id = 'chat-media' and auth.role() = 'authenticated');

create policy "Authenticated users can upload chat media"
  on storage.objects for insert with check (bucket_id = 'chat-media' and auth.role() = 'authenticated');

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
