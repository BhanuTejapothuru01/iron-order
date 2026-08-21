-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table shops enable row level security;
alter table shop_photos enable row level security;
alter table shop_services enable row level security;
alter table shop_hours enable row level security;
alter table reviews enable row level security;

-- Helper function to check if current user is admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES Policies
create policy "Public profiles are viewable by owner or admin"
  on profiles for select
  using (auth.uid() = id or is_admin());

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- SHOPS Policies
create policy "Anyone can read approved shops"
  on shops for select
  using (status = 'approved' or owner_id = auth.uid() or is_admin());

create policy "Owners can create shops"
  on shops for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own shop"
  on shops for update
  using (owner_id = auth.uid() or is_admin());

create policy "Admins or owners can delete shop"
  on shops for delete
  using (owner_id = auth.uid() or is_admin());

-- SHOP PHOTOS Policies
create policy "Photos of approved shops are public"
  on shop_photos for select
  using (
    exists (
      select 1 from shops s 
      where s.id = shop_photos.shop_id 
      and (s.status = 'approved' or s.owner_id = auth.uid() or is_admin())
    )
  );

create policy "Owners can manage shop photos"
  on shop_photos for all
  using (
    exists (
      select 1 from shops s 
      where s.id = shop_photos.shop_id 
      and (s.owner_id = auth.uid() or is_admin())
    )
  );

-- SHOP SERVICES Policies
create policy "Services of approved shops are public"
  on shop_services for select
  using (
    exists (
      select 1 from shops s 
      where s.id = shop_services.shop_id 
      and (s.status = 'approved' or s.owner_id = auth.uid() or is_admin())
    )
  );

create policy "Owners can manage shop services"
  on shop_services for all
  using (
    exists (
      select 1 from shops s 
      where s.id = shop_services.shop_id 
      and (s.owner_id = auth.uid() or is_admin())
    )
  );

-- SHOP HOURS Policies
create policy "Hours of approved shops are public"
  on shop_hours for select
  using (
    exists (
      select 1 from shops s 
      where s.id = shop_hours.shop_id 
      and (s.status = 'approved' or s.owner_id = auth.uid() or is_admin())
    )
  );

create policy "Owners can manage shop hours"
  on shop_hours for all
  using (
    exists (
      select 1 from shops s 
      where s.id = shop_hours.shop_id 
      and (s.owner_id = auth.uid() or is_admin())
    )
  );

-- REVIEWS Policies
create policy "Anyone can read reviews for approved shops"
  on reviews for select
  using (
    exists (
      select 1 from shops s 
      where s.id = reviews.shop_id 
      and (s.status = 'approved' or s.owner_id = auth.uid() or is_admin())
    )
  );

create policy "Authenticated customers can insert review"
  on reviews for insert
  with check (auth.uid() = customer_id);

create policy "Customers or admins can delete review"
  on reviews for delete
  using (auth.uid() = customer_id or is_admin());
