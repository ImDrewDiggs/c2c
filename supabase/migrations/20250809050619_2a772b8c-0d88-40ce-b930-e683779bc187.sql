
-- 1) ORDERS: top-level record for both one-off and subscription checkouts
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  -- one_off | subscription
  type text not null default 'one_off',
  -- monetary amounts in cents
  subtotal integer not null,
  tax integer not null default 0,
  total integer not null,
  currency text not null default 'usd',

  status text not null default 'pending', -- pending | paid | failed | canceled | refunded
  payment_method text,                   -- e.g., 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'zelle'
  stripe_session_id text,
  stripe_payment_intent_id text,

  customer_email text,                   -- helps with guest flows/reconciliation
  billing_address jsonb,                 -- { line1, line2, city, state, postal_code, country }
  service_address text,                  -- optional: for service location
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- helpful indexes and unique constraints for reconciliation
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create unique index if not exists ux_orders_stripe_session on public.orders(stripe_session_id) where stripe_session_id is not null;
create unique index if not exists ux_orders_stripe_intent on public.orders(stripe_payment_intent_id) where stripe_payment_intent_id is not null;

-- RLS for orders
alter table public.orders enable row level security;

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
on public.orders
for select
using (user_id = auth.uid());

drop policy if exists "Users can create their own orders" on public.orders;
create policy "Users can create their own orders"
on public.orders
for insert
with check (user_id = auth.uid());

drop policy if exists "Users can update their own orders" on public.orders;
create policy "Users can update their own orders"
on public.orders
for update
using (user_id = auth.uid());

drop policy if exists "Admins can manage all orders" on public.orders;
create policy "Admins can manage all orders"
on public.orders
for all
using (is_admin_by_email());

-- keep updated_at fresh
drop trigger if exists set_timestamp_orders on public.orders;
create trigger set_timestamp_orders
before update on public.orders
for each row
execute function public.update_updated_at_column();

--------------------------------------------------------------------------------

-- 2) ORDER ITEMS: normalized purchase lines linked to services
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  description text,                 -- fallback if service not provided
  quantity integer not null default 1,
  unit_amount integer not null,     -- in cents
  total_amount integer generated always as (quantity * unit_amount) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_service_id on public.order_items(service_id);

-- RLS for order_items based on order ownership
alter table public.order_items enable row level security;

drop policy if exists "Users can view their own order items" on public.order_items;
create policy "Users can view their own order items"
on public.order_items
for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own order items" on public.order_items;
create policy "Users can create their own order items"
on public.order_items
for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own order items" on public.order_items;
create policy "Users can update their own order items"
on public.order_items
for update
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage all order items" on public.order_items;
create policy "Admins can manage all order items"
on public.order_items
for all
using (is_admin_by_email());

-- keep updated_at fresh
drop trigger if exists set_timestamp_order_items on public.order_items;
create trigger set_timestamp_order_items
before update on public.order_items
for each row
execute function public.update_updated_at_column();

--------------------------------------------------------------------------------

-- 3) Link PAYMENTS to ORDERS (nullable to avoid breaking changes)
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'order_id'
  ) then
    alter table public.payments add column order_id uuid null;
    create index if not exists idx_payments_order_id on public.payments(order_id);
    -- Optional FK: Commented out to avoid strict coupling in case of existing data.
    -- alter table public.payments add constraint payments_order_id_fkey
    --   foreign key (order_id) references public.orders(id) on delete set null;
  end if;
end $$;

--------------------------------------------------------------------------------

-- 4) SUBSCRIBERS table for Stripe subscription state (used by check-subscription)
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  stripe_customer_id text,
  subscribed boolean not null default false,
  subscription_tier text,
  subscription_end timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

drop policy if exists "select_own_subscription" on public.subscribers;
create policy "select_own_subscription" on public.subscribers
for select
using (user_id = auth.uid() or email = auth.email());

drop policy if exists "update_own_subscription" on public.subscribers;
create policy "update_own_subscription" on public.subscribers
for update
using (true);

drop policy if exists "insert_subscription" on public.subscribers;
create policy "insert_subscription" on public.subscribers
for insert
with check (true);

-- keep updated_at fresh
drop trigger if exists set_timestamp_subscribers on public.subscribers;
create trigger set_timestamp_subscribers
before update on public.subscribers
for each row
execute function public.update_updated_at_column();
