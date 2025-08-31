-- Clear existing services and insert comprehensive pricing structure
DELETE FROM public.services;

-- Residential Services (2-month minimum)
INSERT INTO public.services (name, description, price, frequency, category, features, is_active, sort_order) VALUES
(
  'Basic Residential',
  'Essential trash can concierge service for single family homes',
  24.99,
  'monthly',
  'single_family',
  '["1 can C2C service (trash OR recycling)", "2-month minimum commitment"]'::jsonb,
  true,
  1
),
(
  'Standard Residential',
  'Complete waste management solution with cleaning and hazmat services',
  49.99,
  'monthly',
  'single_family',
  '["1 trash + 1 recycling can service", "Monthly cleaning", "Hazmat pickup bi-monthly", "5% discount on add-on services", "2-month minimum commitment"]'::jsonb,
  true,
  2
),
(
  'Premium Residential',
  'Enhanced service with multiple cans and frequent cleaning',
  79.99,
  'monthly',
  'single_family',
  '["2 trash + 1 recycling can service", "Bi-weekly cleaning", "Hazmat pickup monthly", "1 bulk item removal per month", "7% discount on add-on services", "2-month minimum commitment"]'::jsonb,
  true,
  3
),
(
  'Elite Concierge',
  'Ultimate residential service with priority support and comprehensive cleanup',
  169.99,
  'monthly',
  'single_family',
  '["3 trash + 1 recycling can service", "Weekly cleaning", "Weekly hazmat pickup", "Weekly bulk pickup", "Trash area cleanup", "Yard pickup option", "Priority manager", "2-month minimum commitment"]'::jsonb,
  true,
  4
);

-- Multi-Family Services (Min. $400/property contract)
INSERT INTO public.services (name, description, price, frequency, category, features, is_active, sort_order) VALUES
(
  'Basic Multi-Family',
  'Essential waste service for apartment and condo units',
  9.99,
  'monthly',
  'multi_family',
  '["1x/week C2C service", "2 bags per unit", "$400 minimum per property contract"]'::jsonb,
  true,
  5
),
(
  'Standard Multi-Family',
  'Enhanced multi-family service with bulk pickup and dumpster maintenance',
  14.99,
  'monthly',
  'multi_family',
  '["1x/week C2C service", "2 bags per unit", "Bi-monthly bulk pickup", "Monthly dumpster cleaning", "$400 minimum per property contract"]'::jsonb,
  true,
  6
),
(
  'Premium Multi-Family',
  'Comprehensive multi-family service with frequent pickup and area maintenance',
  19.99,
  'monthly',
  'multi_family',
  '["2x/week C2C service", "Deodorized dumpsters", "2x/week area cleanup", "Graffiti cleanup", "Bi-monthly bulk pickup", "Monthly dumpster cleaning", "$400 minimum per property contract"]'::jsonb,
  true,
  7
),
(
  'Elite Multi-Family',
  'Premium daily service with comprehensive property maintenance',
  32.99,
  'monthly',
  'multi_family',
  '["Daily C2C service", "Weekly bulk pickup", "Daily cleanup", "Graffiti cleanup", "Hallway/stairs sweeping", "Common areas cleaning", "$400 minimum per property contract"]'::jsonb,
  true,
  8
);

-- Business Bundles (6-month minimum contracts)
INSERT INTO public.services (name, description, price, frequency, category, features, is_active, sort_order) VALUES
(
  'Restaurant Care Bundle',
  'Specialized service package for restaurants and food service businesses',
  499.00,
  'monthly',
  'business',
  '["Grease hood cleaning (quarterly)", "Monthly dumpster cleaning", "Drive-thru wash (monthly)", "6-month minimum contract", "$499 minimum ticket"]'::jsonb,
  true,
  9
),
(
  'Property Manager Bundle',
  'Comprehensive property management support services',
  699.00,
  'monthly',
  'business',
  '["Multi-family concierge service", "Monthly dumpster cleaning", "Quarterly lot pressure wash", "6-month minimum contract", "$499 minimum ticket"]'::jsonb,
  true,
  10
),
(
  'Corporate/Office Bundle',
  'Professional office building maintenance and waste management',
  999.00,
  'monthly',
  'business',
  '["Weekly C2C service", "Monthly dumpster maintenance", "Quarterly exterior wash", "Graffiti cleanup", "6-month minimum contract", "$499 minimum ticket"]'::jsonb,
  true,
  11
);

-- Commercial Services (A La Carte)
INSERT INTO public.services (name, description, price, frequency, category, features, is_active, sort_order) VALUES
(
  'Grease Hood Cleaning - Small',
  'Professional grease hood cleaning for small commercial kitchens',
  299.00,
  'one_time',
  'commercial',
  '["Small kitchen size", "Professional equipment cleaning", "Health code compliance"]'::jsonb,
  true,
  12
),
(
  'Grease Hood Cleaning - Medium',
  'Professional grease hood cleaning for medium commercial kitchens',
  399.00,
  'one_time',
  'commercial',
  '["Medium kitchen size", "Professional equipment cleaning", "Health code compliance"]'::jsonb,
  true,
  13
),
(
  'Grease Hood Cleaning - Large',
  'Professional grease hood cleaning for large commercial kitchens',
  599.00,
  'one_time',
  'commercial',
  '["Large kitchen size", "Professional equipment cleaning", "Health code compliance", "Custom pricing for oversized operations"]'::jsonb,
  true,
  14
),
(
  'Cardboard Pickup Service',
  'Regular cardboard waste pickup for businesses',
  89.00,
  'monthly',
  'commercial',
  '["Monthly cardboard collection", "Pricing range $79-$99 based on volume"]'::jsonb,
  true,
  15
),
(
  'Parking Lot Pressure Wash - Small',
  'Professional pressure washing for small parking lots',
  399.00,
  'one_time',
  'commercial',
  '["Under 10,000 sqft", "Professional equipment", "Eco-friendly cleaning solutions"]'::jsonb,
  true,
  16
),
(
  'Parking Lot Pressure Wash - Medium',
  'Professional pressure washing for medium parking lots',
  699.00,
  'one_time',
  'commercial',
  '["10,000 - 50,000 sqft", "Professional equipment", "Eco-friendly cleaning solutions"]'::jsonb,
  true,
  17
),
(
  'Parking Lot Pressure Wash - Large',
  'Professional pressure washing for large parking lots',
  999.00,
  'one_time',
  'commercial',
  '["Over 50,000 sqft", "Professional equipment", "Eco-friendly cleaning solutions", "Custom pricing for oversized lots"]'::jsonb,
  true,
  18
),
(
  'Drive-Thru Pressure Wash',
  'Specialized drive-thru area cleaning service',
  249.00,
  'one_time',
  'commercial',
  '["Drive-thru lane cleaning", "Professional equipment", "Minimal disruption to operations"]'::jsonb,
  true,
  19
),
(
  'Exterior Building Wash - Small',
  'Professional exterior building cleaning for small buildings',
  499.00,
  'one_time',
  'commercial',
  '["Under 10,000 sqft", "Professional pressure washing", "Window and facade cleaning"]'::jsonb,
  true,
  20
),
(
  'Exterior Building Wash - Medium',
  'Professional exterior building cleaning for medium buildings',
  799.00,
  'one_time',
  'commercial',
  '["10,000 - 50,000 sqft", "Professional pressure washing", "Window and facade cleaning"]'::jsonb,
  true,
  21
),
(
  'Exterior Building Wash - Large',
  'Professional exterior building cleaning for large buildings',
  1499.00,
  'one_time',
  'commercial',
  '["Over 50,000 sqft", "Professional pressure washing", "Window and facade cleaning", "Custom pricing for oversized buildings"]'::jsonb,
  true,
  22
);

-- Add-On Services
INSERT INTO public.services (name, description, price, frequency, category, features, is_active, sort_order) VALUES
(
  'Extra Can Service',
  'Additional trash or recycling can service',
  9.99,
  'monthly',
  'addon',
  '["Additional can pickup", "Flexible scheduling", "Can be added to any plan"]'::jsonb,
  true,
  23
),
(
  'Extra Cleaning Service',
  'Additional cleaning service for trash areas',
  14.99,
  'one_time',
  'addon',
  '["Per-service pricing", "Trash area sanitization", "Can be scheduled as needed"]'::jsonb,
  true,
  24
),
(
  'Priority Same-Day Service',
  'Emergency same-day pickup and service',
  49.99,
  'one_time',
  'addon',
  '["Same-day response", "Priority scheduling", "Emergency cleanup"]'::jsonb,
  true,
  25
),
(
  'Bulk Item Removal',
  'Large item pickup and disposal service',
  72.00,
  'one_time',
  'addon',
  '["Large item pickup", "Pricing range $45-$99 based on size", "Proper disposal methods"]'::jsonb,
  true,
  26
),
(
  'Yard Pickup Service',
  'Yard waste and debris removal',
  50.00,
  'one_time',
  'addon',
  '["Yard waste collection", "Pricing range $25-$75 based on volume", "Seasonal availability"]'::jsonb,
  true,
  27
),
(
  'Holiday Bulk Pickup',
  'Special holiday waste pickup service',
  59.00,
  'one_time',
  'addon',
  '["Holiday schedule pickup", "Increased volume capacity", "Custom pricing for large amounts"]'::jsonb,
  true,
  28
),
(
  'Event Cleanup Service',
  'Custom cleanup service for events and special occasions',
  999.99,
  'one_time',
  'addon',
  '["Custom quote pricing", "Event planning coordination", "Comprehensive cleanup", "Flexible scheduling"]'::jsonb,
  true,
  29
);