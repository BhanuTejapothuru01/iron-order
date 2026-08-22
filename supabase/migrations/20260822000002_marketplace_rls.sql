-- Enable RLS on newly created marketplace tables
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table commission_settings enable row level security;
alter table commission_settlements enable row level security;
alter table notifications enable row level security;

-- ADDRESSES POLICIES
create policy "Customers can manage own addresses"
  on addresses for all
  using (auth.uid() = customer_id or is_admin());

-- ORDERS POLICIES
create policy "Customers can read own orders"
  on orders for select
  using (auth.uid() = customer_id or is_admin());

create policy "Customers can insert own orders"
  on orders for insert
  with check (auth.uid() = customer_id);

create policy "Shop owners can view orders for their shop"
  on orders for select
  using (
    exists (
      select 1 from shops s
      where s.id = orders.shop_id and s.owner_id = auth.uid()
    )
    or is_admin()
  );

create policy "Shop owners can update status of orders for their shop"
  on orders for update
  using (
    exists (
      select 1 from shops s
      where s.id = orders.shop_id and s.owner_id = auth.uid()
    )
    or is_admin()
  );

-- ORDER ITEMS POLICIES
create policy "Users can read order items for accessible orders"
  on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
      and (
        o.customer_id = auth.uid()
        or exists (select 1 from shops s where s.id = o.shop_id and s.owner_id = auth.uid())
        or is_admin()
      )
    )
  );

create policy "Customers can insert items for own orders"
  on order_items for insert
  with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );

-- COMMISSION SETTINGS POLICIES
create policy "Anyone can view commission rate"
  on commission_settings for select
  using (true);

create policy "Admins can update commission settings"
  on commission_settings for all
  using (is_admin());

-- COMMISSION SETTLEMENTS POLICIES
create policy "Shop owners can view settlements for their shop"
  on commission_settlements for select
  using (
    exists (
      select 1 from shops s
      where s.id = commission_settlements.shop_id and s.owner_id = auth.uid()
    )
    or is_admin()
  );

create policy "Admins can manage settlements"
  on commission_settlements for all
  using (is_admin());

-- NOTIFICATIONS POLICIES
create policy "Users can view and update own notifications"
  on notifications for all
  using (auth.uid() = user_id or is_admin());
