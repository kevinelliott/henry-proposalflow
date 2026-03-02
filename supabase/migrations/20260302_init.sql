-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  company_name text,
  logo_url text,
  brand_color text not null default '#7c3aed',
  subscription_status text,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Proposals
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  client_company text,
  title text not null,
  intro_message text,
  status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','declined','expired')),
  valid_until date,
  public_token text not null unique,
  currency text not null default 'USD',
  total_amount numeric(12,2) not null default 0,
  notes text,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  declined_at timestamptz
);

alter table proposals enable row level security;

create policy "Users can manage own proposals" on proposals
  for all using (auth.uid() = user_id);

create policy "Public can view proposals by token" on proposals
  for select using (true);

-- Line items
create table if not exists line_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  sort_order int not null default 0
);

alter table line_items enable row level security;

create policy "Users can manage line items of own proposals" on line_items
  for all using (
    exists (select 1 from proposals where proposals.id = line_items.proposal_id and proposals.user_id = auth.uid())
  );

create policy "Public can view line items" on line_items
  for select using (true);

-- Proposal views
create table if not exists proposal_views (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

alter table proposal_views enable row level security;

create policy "Users can view own proposal views" on proposal_views
  for select using (
    exists (select 1 from proposals where proposals.id = proposal_views.proposal_id and proposals.user_id = auth.uid())
  );

create policy "Anyone can insert view" on proposal_views
  for insert with check (true);

-- Follow-ups
create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending','sent','cancelled')),
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table follow_ups enable row level security;

create policy "Users can manage own follow-ups" on follow_ups
  for all using (
    exists (select 1 from proposals where proposals.id = follow_ups.proposal_id and proposals.user_id = auth.uid())
  );

create policy "Service role can manage all follow-ups" on follow_ups
  for all using (auth.role() = 'service_role');

-- Indexes
create index if not exists proposals_user_id_idx on proposals(user_id);
create index if not exists proposals_token_idx on proposals(public_token);
create index if not exists follow_ups_status_idx on follow_ups(status, scheduled_for);
create index if not exists proposal_views_proposal_id_idx on proposal_views(proposal_id);
