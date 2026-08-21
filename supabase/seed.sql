-- Seed data for Local Ironing Finder

-- Seed Profiles
insert into profiles (id, role, full_name, phone) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'System Admin', '+1 555-0100'),
  ('00000000-0000-0000-0000-000000000002', 'owner', 'Rajesh Kumar', '+1 555-0101'),
  ('00000000-0000-0000-0000-000000000003', 'owner', 'Elena Rostova', '+1 555-0102'),
  ('00000000-0000-0000-0000-000000000004', 'owner', 'Michael Chen', '+1 555-0103'),
  ('00000000-0000-0000-0000-000000000005', 'customer', 'Priya Sharma', '+1 555-0104'),
  ('00000000-0000-0000-0000-000000000006', 'customer', 'David Miller', '+1 555-0105')
on conflict (id) do nothing;

-- Seed Shops (Centered around test coordinates lat: 12.9716, lng: 77.5946 - Bangalore Central)
insert into shops (id, owner_id, name, description, latitude, longitude, address, phone, whatsapp, status, pickup_available, delivery_available, avg_rating, review_count) values
  -- Shop 1: < 1 km (0.4 km)
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 
   'Express Steam Press & Dry Care', 
   'Premium crisp steam ironing for shirts, suits, and formal wear. Quick 2-hour turnarounds available!', 
   12.9738, 77.5975, '45 MG Road, Near Metro Station, Bangalore', '+91 98765 43210', '+919876543210', 
   'approved', true, true, 4.8, 24),

  -- Shop 2: < 1 km (0.8 km)
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000003', 
   'Royal Linen Pressing Hub', 
   'Specialized in delicate ethnic sarees, silk dresses, and formal suits with protective steam finish.', 
   12.9680, 77.5910, '12 Brigade Road, Ground Floor, Bangalore', '+91 98123 45678', '+919812345678', 
   'approved', false, true, 4.6, 18),

  -- Shop 3: 1-5 km (2.3 km)
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000004', 
   'Indiranagar Fresh Pressers', 
   'Reliable neighborhood ironing shop for daily clothes, bedsheets, and curtain pressing.', 
   12.9784, 77.6408, '789 100 Feet Road, Indiranagar, Bangalore', '+91 97654 32109', '+919765432109', 
   'approved', true, false, 4.4, 32),

  -- Shop 4: 1-5 km (3.8 km)
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000002', 
   'Koramangala Crisp Express', 
   'Eco-friendly steam pressing with zero chemical odor. Same-day service available!', 
   12.9352, 77.6245, '88 5th Block, Koramangala, Bangalore', '+91 96543 21098', '+919654321098', 
   'approved', true, true, 4.9, 15),

  -- Shop 5: 5+ km (8.2 km)
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000003', 
   'Whitefield Tech Park Ironing Works', 
   'Corporate clothes care specialist. Heavy duty steam pressing for corporate uniforms and suits.', 
   12.9698, 77.7499, '102 ITPL Main Road, Whitefield, Bangalore', '+91 95432 10987', '+919543210987', 
   'approved', false, false, 4.2, 9),

  -- Shop 6: Pending (for Admin testing)
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000004', 
   'Metro Care Steam Pressing', 
   'New shop request awaiting admin approval.', 
   12.9750, 77.6000, '15 Commercial Street, Bangalore', '+91 94321 09876', '+919432109876', 
   'pending', true, true, 0.0, 0)
on conflict (id) do nothing;

-- Seed Services
insert into shop_services (shop_id, service_name, price) values
  -- Express Steam Press
  ('11111111-1111-1111-1111-111111111111', 'Shirt / T-Shirt Press', 15.00),
  ('11111111-1111-1111-1111-111111111111', 'Trousers / Jeans Press', 20.00),
  ('11111111-1111-1111-1111-111111111111', 'Suit (2-Piece) Steam', 80.00),
  ('11111111-1111-1111-1111-111111111111', 'Silk Saree Press', 60.00),

  -- Royal Linen
  ('22222222-2222-2222-2222-222222222222', 'Shirt Pressing', 18.00),
  ('22222222-2222-2222-2222-222222222222', 'Pants Pressing', 22.00),
  ('22222222-2222-2222-2222-222222222222', 'Heavy Designer Saree', 75.00),

  -- Indiranagar Fresh
  ('33333333-3333-3333-3333-333333333333', 'Basic Shirt Press', 12.00),
  ('33333333-3333-3333-3333-333333333333', 'Basic Trouser Press', 15.00),
  ('33333333-3333-3333-3333-333333333333', 'Bedsheet / Curtain', 40.00),

  -- Koramangala Crisp
  ('44444444-4444-4444-4444-444444444444', 'Eco-Steam Shirt', 20.00),
  ('44444444-4444-4444-4444-444444444444', 'Eco-Steam Trouser', 25.00),
  ('44444444-4444-4444-4444-444444444444', 'Blazer / Jacket', 70.00),

  -- Whitefield Tech Park
  ('55555555-5555-5555-5555-555555555555', 'Corporate Shirt', 15.00),
  ('55555555-5555-5555-5555-555555555555', 'Corporate Pant', 18.00)
on conflict do nothing;

-- Seed Operating Hours (0=Sun, 1=Mon, ..., 6=Sat)
insert into shop_hours (shop_id, day_of_week, open_time, close_time, is_closed) values
  -- Express Steam Press (Open Mon-Sat 08:00 - 20:00, Sun Closed)
  ('11111111-1111-1111-1111-111111111111', 0, null, null, true),
  ('11111111-1111-1111-1111-111111111111', 1, '08:00', '20:00', false),
  ('11111111-1111-1111-1111-111111111111', 2, '08:00', '20:00', false),
  ('11111111-1111-1111-1111-111111111111', 3, '08:00', '20:00', false),
  ('11111111-1111-1111-1111-111111111111', 4, '08:00', '20:00', false),
  ('11111111-1111-1111-1111-111111111111', 5, '08:00', '20:00', false),
  ('11111111-1111-1111-1111-111111111111', 6, '08:00', '20:00', false),

  -- Royal Linen (Open 7 days 09:00 - 21:00)
  ('22222222-2222-2222-2222-222222222222', 0, '09:00', '18:00', false),
  ('22222222-2222-2222-2222-222222222222', 1, '09:00', '21:00', false),
  ('22222222-2222-2222-2222-222222222222', 2, '09:00', '21:00', false),
  ('22222222-2222-2222-2222-222222222222', 3, '09:00', '21:00', false),
  ('22222222-2222-2222-2222-222222222222', 4, '09:00', '21:00', false),
  ('22222222-2222-2222-2222-222222222222', 5, '09:00', '21:00', false),
  ('22222222-2222-2222-2222-222222222222', 6, '09:00', '21:00', false)
on conflict do nothing;

-- Seed Reviews
insert into reviews (shop_id, customer_id, rating, comment) values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000005', 5, 'Extremely fast and crisp pressing! My formal shirts look brand new.'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000006', 4, 'Great service and friendly staff. Pickup arrived right on time.'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000005', 5, 'They handled my silk saree with immense care. No shine or burns at all.')
on conflict do nothing;
