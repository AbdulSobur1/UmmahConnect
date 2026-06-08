create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  action text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  created_at timestamptz not null default now(),
  unique (identifier, action, window_start)
);

create index if not exists idx_rate_limits_lookup
  on public.rate_limits(identifier, action, window_start);

create index if not exists idx_rate_limits_window
  on public.rate_limits(window_start);

alter table public.rate_limits enable row level security;

-- Only service role can access rate limits
create policy "Service role only"
  on public.rate_limits for all
  using (false);
