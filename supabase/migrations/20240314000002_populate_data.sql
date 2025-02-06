-- Start transaction for atomic operations
BEGIN;

-- Create test users and store their IDs
CREATE TABLE IF NOT EXISTS test_users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE
);

WITH inserted_users AS (
    INSERT INTO auth.users (
        id, instance_id, aud, role, email,
        encrypted_password, email_confirmed_at,
        created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new,
        raw_app_meta_data, raw_user_meta_data,
        is_super_admin
    )
    SELECT
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'testuser' || seq || '@test.com',
        crypt('testpassword', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        NULL,
        NULL,
        NULL,
        jsonb_build_object(
            'provider', 'email',
            'providers', ARRAY['email']
        ),
        jsonb_build_object(
            'username', 'testuser' || seq
        ),
        FALSE
    FROM generate_series(1,10) seq
    RETURNING id, email
)
INSERT INTO test_users (id, email)
SELECT id, email FROM inserted_users;

-- Insert sample products
INSERT INTO products (
    name, brand, category, price, rating, details, image_url, description, slug,
    created_at, metadata, source_url
) VALUES (
    'Logitech G502 X PLUS',
    'Logitech',
    'Gaming Mouse',
    149.99,
    4.8,
    jsonb_build_object(
        'dpi', '25600',
        'buttons', '13',
        'weight', '89g',
        'connection', 'LIGHTSPEED Wireless',
        'sensor', 'HERO 25K',
        'battery_life', '130 hours',
        'rgb', true
    ),
    'https://resource.logitechg.com/w_692,c_limit,q_auto,f_auto,dpr_2.0/d_transparent.gif/content/dam/gaming/en/products/g502x-plus/gallery/g502x-plus-gallery-1-black.png',
    'LIGHTFORCE hybrid optical-mechanical switches and LIGHTSPEED wireless technology combine in our most advanced gaming mouse ever.',
    'logitech-g502-x-plus',
    NOW(),
    jsonb_build_object(
        'manufacturer_url', 'https://www.logitechg.com/en-us/products/gaming-mice/g502-x-plus-wireless-lightspeed-gaming-mouse.html',
        'specs_url', 'https://www.logitechg.com/en-us/products/gaming-mice/g502-x-plus-wireless-lightspeed-gaming-mouse.html#product-tech-specs',
        'alternative_images', ARRAY[
            'https://resource.logitechg.com/w_692,c_limit,q_auto,f_auto,dpr_2.0/d_transparent.gif/content/dam/gaming/en/products/g502x-plus/gallery/g502x-plus-gallery-2-black.png',
            'https://resource.logitechg.com/w_692,c_limit,q_auto,f_auto,dpr_2.0/d_transparent.gif/content/dam/gaming/en/products/g502x-plus/gallery/g502x-plus-gallery-3-black.png'
        ],
        'features', ARRAY[
            'LIGHTFORCE Hybrid Switches',
            'LIGHTSPEED Wireless',
            'HERO 25K Sensor',
            'PowerPlay Compatible'
        ]
    ),
    'https://www.logitechg.com/en-us/products/gaming-mice/g502-x-plus-wireless-lightspeed-gaming-mouse.html'
),
(
    'Razer Viper V2 Pro',
    'Razer',
    'Gaming Mouse',
    129.99,
    4.7,
    jsonb_build_object(
        'dpi', '30000',
        'buttons', '5',
        'weight', '58g',
        'connection', 'Wireless',
        'sensor', 'Focus Pro 30K',
        'battery_life', '80 hours',
        'rgb', false
    ),
    'https://assets3.razerzone.com/3_cgChPShHyQJVsWi-jMCgq7530Y=/1500x1000/https%3A%2F%2Fhybrismediaprod.blob.core.windows.net%2Fsys-master-phoenix-images-container%2Fh78%2Fh24%2F9419340275742%2Fviper-v2-pro-black-1500x1000-1.jpg',
    'Ultra-lightweight wireless gaming mouse with next-gen optical switches.',
    'razer-viper-v2-pro',
    NOW(),
    jsonb_build_object(
        'manufacturer_url', 'https://www.razer.com/gaming-mice/razer-viper-v2-pro',
        'features', ARRAY[
            'Focus Pro 30K Optical Sensor',
            'Optical Mouse Switches Gen-3',
            'Ultra-lightweight Design',
            'Up to 80 Hour Battery Life'
        ]
    ),
    'https://www.razer.com/gaming-mice/razer-viper-v2-pro'
);

-- Generate reviews and votes
DO $$
DECLARE
    product_record RECORD;
    user_record RECORD;
    vote_types TEXT[] := ARRAY['up', 'down'];
    review_texts TEXT[] := ARRAY[
        'After extensive testing in competitive matches, this product has exceeded my expectations. The response time and precision are outstanding.',
        'The build quality and performance are exceptional. Every detail has been carefully considered, from the ergonomics to the software integration.',
        'A perfect balance of features and performance. The customization options are extensive, and the quality is top-notch.'
    ];
BEGIN
    -- Generate reviews and votes for each product
    FOR product_record IN SELECT * FROM products LOOP
        -- Generate reviews
        FOR user_record IN SELECT * FROM test_users ORDER BY random() LIMIT floor(random() * 5 + 2)::int LOOP
            INSERT INTO reviews (
                id, product_id, user_id, rating, title, content, created_at
            ) VALUES (
                gen_random_uuid(),
                product_record.id,
                user_record.id,
                floor(random() * 3 + 3)::int,  -- Ratings between 3 and 5
                'Review for ' || product_record.name,
                review_texts[floor(random() * array_length(review_texts, 1) + 1)::int],
                NOW() - (random() * interval '30 days')
            );
        END LOOP;

        -- Generate votes
        FOR user_record IN SELECT * FROM test_users ORDER BY random() LIMIT floor(random() * 8 + 2)::int LOOP
            INSERT INTO product_votes (
                id, product_id, user_id, vote_type, created_at
            ) VALUES (
                gen_random_uuid(),
                product_record.id,
                user_record.id,
                vote_types[floor(random() * array_length(vote_types, 1) + 1)::int],
                NOW() - (random() * interval '30 days')
            );
        END LOOP;
    END LOOP;
END $$;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW product_rankings;

COMMIT; 