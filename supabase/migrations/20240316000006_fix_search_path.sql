-- Drop existing functions and views
DROP FUNCTION IF EXISTS refresh_product_rankings CASCADE;
DROP FUNCTION IF EXISTS update_product_ranking CASCADE;
DROP MATERIALIZED VIEW IF EXISTS product_rankings;

-- Recreate the materialized view with proper security
CREATE MATERIALIZED VIEW product_rankings AS
WITH vote_counts AS (
    SELECT 
        product_id,
        COUNT(CASE WHEN vote_type = 'up' THEN 1 END) as upvotes,
        COUNT(CASE WHEN vote_type = 'down' THEN 1 END) as downvotes
    FROM product_votes
    GROUP BY product_id
),
review_stats AS (
    SELECT 
        product_id,
        AVG(rating) as avg_rating,
        COUNT(*) as review_count
    FROM reviews
    GROUP BY product_id
)
SELECT 
    p.id,
    p.name,
    p.description,
    p.image_url,
    p.price,
    p.category,
    p.slug,
    COALESCE(v.upvotes, 0) as upvotes,
    COALESCE(v.downvotes, 0) as downvotes,
    COALESCE(r.avg_rating, 0) as rating,
    COALESCE(r.review_count, 0) as review_count,
    COALESCE(v.upvotes, 0) - COALESCE(v.downvotes, 0) as net_score,
    ROW_NUMBER() OVER (ORDER BY (COALESCE(v.upvotes, 0) - COALESCE(v.downvotes, 0)) DESC) as rank
FROM 
    products p
    LEFT JOIN vote_counts v ON p.id = v.product_id
    LEFT JOIN review_stats r ON p.id = r.product_id;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_product_rankings_id ON product_rankings (id);

-- Create function to refresh rankings with explicit search path
CREATE OR REPLACE FUNCTION refresh_product_rankings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_rankings;
    RETURN NULL;
END;
$$;

-- Create function to update product ranking with explicit search path
CREATE OR REPLACE FUNCTION update_product_ranking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW product_rankings;
    RETURN NEW;
END;
$$;

-- Set proper permissions
REVOKE ALL ON product_rankings FROM PUBLIC;
GRANT SELECT ON product_rankings TO authenticated, anon;
GRANT ALL ON product_rankings TO postgres, service_role;

-- Revoke and regrant function execution permissions
REVOKE ALL ON FUNCTION refresh_product_rankings() FROM PUBLIC;
REVOKE ALL ON FUNCTION update_product_ranking() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION refresh_product_rankings() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_product_ranking() TO authenticated, anon;

-- Refresh the view
REFRESH MATERIALIZED VIEW product_rankings; 