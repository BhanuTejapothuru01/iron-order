-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Create Enums for Order Workflow & Payment Status
create type order_status as enum (
  'pending',
  'accepted',
  'rejected',
  'processing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled'
);

create type payment_status as enum (
  'pending',
  'paid_to_shop',
  'failed',
  'refunded'
);

create type payment_method as enum (
  'cash',
  'upi',
  'pay_to_shop',
  'other'
);

-- Customer Addresses Table
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  address_line text not null,
  landmark text,
  city text not null default 'Bengaluru',
  pincode text,
  phone text,
  is_default boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Extend shop_services with description and is_active flag if not present
alter table shop_services 
  add column if not exists description text,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

-- Extend shops with min order and service area
alter table shops
  add column if not exists min_order_amount numeric(10,2) default 0.00,
  add column if not exists service_area_km numeric(5,2) default 5.00;

-- Orders Table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial,
  customer_id uuid not null references profiles(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  address_id uuid references addresses(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text,
  status order_status not null default 'pending',
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null default 0.00 check (delivery_fee >= 0),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  payment_method payment_method not null default 'cash',
  payment_status payment_status not null default 'pending',
  paid_at timestamptz,
  commission_rate numeric(5,2) not null default 10.00,
  commission_amount numeric(10,2) not null default 0.00,
  shop_earnings numeric(10,2) not null default 0.00,
  pickup_requested boolean not null default false,
  delivery_requested boolean not null default false,
  scheduled_date date,
  scheduled_time text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order Items Table (Snapshotted)
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  service_id uuid references shop_services(id) on delete set null,
  service_name_snapshot text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

-- Commission Settings Table (Global Platform Configuration)
create table if not exists commission_settings (
  id uuid primary key default gen_random_uuid(),
  default_rate numeric(5,2) not null default 10.00,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

-- Initialize default commission settings if empty
insert into commission_settings (default_rate)
select 10.00
where not exists (select 1 from commission_settings);

-- Commission Settlements Table (Admin Payout Bookkeeping)
create table if not exists commission_settlements (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'settled')),
  settled_at timestamptz,
  settlement_reference text,
  settled_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Notifications Table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  order_id uuid references orders(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Add order_id to reviews if missing
alter table reviews 
  add column if not exists order_id uuid references orders(id) on delete set null;

-- Indexes for performance
create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_shop_id on orders(shop_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_commission_settlements_shop_id on commission_settlements(shop_id);
