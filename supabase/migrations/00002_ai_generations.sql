-- =============================================
-- AI GENERATIONS (audit log for all AI content)
-- =============================================
create table public.ai_generations (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  requested_by uuid references public.profiles(id) on delete set null not null,
  type text not null check (type in ('obituary', 'biography', 'tribute', 'comment', 'moderation')),
  provider text not null default 'openai',
  model text not null default 'gpt-4o',
  prompt_data jsonb not null default '{}'::jsonb,
  output_text text,
  tokens_used integer not null default 0,
  cost_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'generating', 'completed', 'failed', 'rejected')),
  style text, -- formal, warm, celebratory (obituary); chronological, thematic (biography)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ai_generations_memorial on public.ai_generations using btree (memorial_id);
create index idx_ai_generations_user on public.ai_generations using btree (requested_by);
create index idx_ai_generations_type on public.ai_generations using btree (type);

create trigger set_ai_generations_updated_at
  before update on public.ai_generations
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.ai_generations enable row level security;

create policy "Users can view AI generations for memorials they host"
  on public.ai_generations for select using (
    requested_by = auth.uid() or
    exists (
      select 1 from public.memorial_hosts
      where memorial_id = ai_generations.memorial_id
        and user_id = auth.uid()
        and role in ('owner', 'co_host')
    )
  );

create policy "Authenticated users can create AI generations"
  on public.ai_generations for insert with check (auth.uid() = requested_by);

create policy "Users can update own AI generations"
  on public.ai_generations for update using (auth.uid() = requested_by);
