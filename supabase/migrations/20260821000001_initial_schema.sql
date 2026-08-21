-- Enable geospatial distance support
create extension if not exists cube;
create extension if not exists earthdistance;

-- Create custom enums
create type shop_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type user_role as enum ('customer', 'owner', 'admin');

-- Profiles table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- Shops table
create table shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  phone text,
  whatsapp text,
  status shop_status not null default 'pending',
  pickup_available boolean not null default false,
  delivery_available boolean not null default false,
  avg_rating numeric(2,1) default 0.0,
  review_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shop photos table
create table shop_photos (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  storage_path text not null,
  sort_order integer default 0
);

-- Shop services table
create table shop_services (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  service_name text not null,     -- e.g. "Shirt Pressing", "Saree Steam", "Suit Pressing"
  price numeric(10,2) not null
);

-- Shop hours table
create table shop_hours (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),  -- 0=Sunday..6=Saturday
  open_time time,
  close_time time,
  is_closed boolean default false
);

-- Reviews table
create table reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint unique_customer_shop_review unique (shop_id, customer_id)
);

-- Nearby shop search RPC function (radius in km)
create or replace function get_nearby_shops(
  in_lat double precision,
  in_lng double precision,
  radius_km double precision default 5.0
)
returns table (
  id uuid,
  name text,
  description text,
  latitude double precision,
  longitude double precision,
  distance_km double precision,
  avg_rating numeric,
  review_count integer,
  address text,
  phone text,
  whatsapp text,
  status shop_status,
  pickup_available boolean,
  delivery_available boolean
)
language sql stable as $$
  select 
    s.id, 
    s.name, 
    s.description,
    s.latitude, 
    s.longitude,
    round((earth_distance(ll_to_earth(in_lat, in_lng), ll_to_earth(s.latitude, s.longitude)) / 1000.0)::numeric, 2)::double precision as distance_km,
    s.avg_rating,
    s.review_count,
    s.address,
    s.phone,
    s.whatsapp,
    s.status,
    s.pickup_available,
    s.delivery_available
  from shops s
  where s.status = 'approved'
    and earth_box(ll_to_earth(in_lat, in_lng), radius_km * 1000.0) @> ll_to_earth(s.latitude, s.longitude)
  order by distance_km asc;
$$;

-- Trigger to recalculate shop avg_rating and review_count on review changes
create or replace function recalculate_shop_rating()
returns trigger language plpgsql as $$
begin
  update shops
  set 
    avg_rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where shop_id = coalesce(new.shop_id, old.shop_id)), 0.0),
    review_count = (select count(*) from reviews where shop_id = coalesce(new.shop_id, old.shop_id)),
    updated_at = now()
  where id = coalesce(new.shop_id, old.shop_id);
  return new;
end;
$$;

create trigger tr_recalculate_shop_rating
after insert or update or delete on reviews
for each row execute function recalculate_shop_rating();
