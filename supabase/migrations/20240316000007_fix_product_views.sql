-- Drop existing views and functions
DROP MATERIALIZED VIEW IF EXISTS product_rankings;
DROP FUNCTION IF EXISTS refresh_product_rankings CASCADE;
DROP FUNCTION IF EXISTS update_product_ranking CASCADE;

-- Create product views materialized view
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
    ROW_NUMBER() OVER (
        PARTITION BY p.category 
        ORDER BY (COALESCE(v.upvotes, 0) - COALESCE(v.downvotes, 0)) DESC
    ) as category_rank,
    ROW_NUMBER() OVER (
        ORDER BY (COALESCE(v.upvotes, 0) - COALESCE(v.downvotes, 0)) DESC
    ) as overall_rank
FROM 
    products p
    LEFT JOIN vote_counts v ON p.id = v.product_id
    LEFT JOIN review_stats r ON p.id = r.product_id;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_product_rankings_id ON product_rankings (id);

-- Add comment for GraphQL support
COMMENT ON MATERIALIZED VIEW product_rankings IS E'@graphql({"primary_key_columns": ["id"]})';

-- Create function to refresh rankings
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

-- Create triggers to refresh rankings
DROP TRIGGER IF EXISTS refresh_rankings_on_vote ON product_votes;
CREATE TRIGGER refresh_rankings_on_vote
    AFTER INSERT OR UPDATE OR DELETE ON product_votes
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_product_rankings();

DROP TRIGGER IF EXISTS refresh_rankings_on_review ON reviews;
CREATE TRIGGER refresh_rankings_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_product_rankings();

-- Set proper permissions
REVOKE ALL ON product_rankings FROM PUBLIC;
GRANT SELECT ON product_rankings TO authenticated, anon;
GRANT ALL ON product_rankings TO postgres, service_role;

-- Revoke and regrant function execution permissions
REVOKE ALL ON FUNCTION refresh_product_rankings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION refresh_product_rankings() TO authenticated, anon;

-- Initial refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY product_rankings;

-- Create RLS policies for products
CREATE POLICY "Enable read access for all users"
    ON products FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert for authenticated users only"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users only"
    ON products FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL); 