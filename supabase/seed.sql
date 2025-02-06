-- Create test users
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
)
VALUES 
(
    'd0d8c19c-3b3e-4f5a-9b1a-e3cce01a9c5c',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test1@example.com',
    crypt('testpassword', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NULL,
    NULL,
    NULL,
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '{"name": "Test User 1"}'::jsonb,
    FALSE
),
(
    'e1e9c2ad-4c4f-4f6b-0c2b-f4ddf1b0d6d7',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test2@example.com',
    crypt('testpassword', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NULL,
    NULL,
    NULL,
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '{"name": "Test User 2"}'::jsonb,
    FALSE
);

-- Create test products
INSERT INTO products (id, name, brand, category, price, rating, details, image_url, description, slug, metadata, source_url)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Test Product 1', 'TestBrand', 'Electronics', 99.99, 4.5, 
   '{"features": ["Feature 1", "Feature 2"], "specs": {"weight": "200g", "dimensions": "10x5x2cm"}}'::jsonb,
   'https://example.com/img1.jpg', 'A great test product', 'test-product-1',
   '{"manufacturer_url": "https://example.com/prod1"}'::jsonb, 'https://example.com/prod1'),
  
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Test Product 2', 'TestBrand', 'Electronics', 149.99, 4.0,
   '{"features": ["Feature 1", "Feature 2"], "specs": {"weight": "250g", "dimensions": "12x6x2cm"}}'::jsonb,
   'https://example.com/img2.jpg', 'Another amazing product', 'test-product-2',
   '{"manufacturer_url": "https://example.com/prod2"}'::jsonb, 'https://example.com/prod2'),
  
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Test Product 3', 'TestBrand', 'Electronics', 199.99, 4.8,
   '{"features": ["Feature 1", "Feature 2"], "specs": {"weight": "180g", "dimensions": "9x4x2cm"}}'::jsonb,
   'https://example.com/img3.jpg', 'The best product ever', 'test-product-3',
   '{"manufacturer_url": "https://example.com/prod3"}'::jsonb, 'https://example.com/prod3');

-- Add some product votes
INSERT INTO product_votes (product_id, user_id, vote_type)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0d8c19c-3b3e-4f5a-9b1a-e3cce01a9c5c', 'up'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0d8c19c-3b3e-4f5a-9b1a-e3cce01a9c5c', 'down'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e1e9c2ad-4c4f-4f6b-0c2b-f4ddf1b0d6d7', 'up'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e1e9c2ad-4c4f-4f6b-0c2b-f4ddf1b0d6d7', 'up');

-- Add some reviews
INSERT INTO reviews (product_id, user_id, rating, title, content)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0d8c19c-3b3e-4f5a-9b1a-e3cce01a9c5c', 5, 'Amazing Product!', 'Great product, exceeded my expectations!'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e1e9c2ad-4c4f-4f6b-0c2b-f4ddf1b0d6d7', 4, 'Pretty Good', 'Good value for money, would recommend.'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0d8c19c-3b3e-4f5a-9b1a-e3cce01a9c5c', 5, 'Best Purchase Ever!', 'This is the best product I have ever bought!'); 