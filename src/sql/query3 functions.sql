CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- DROP FUNCTION public.fun_get_shop_products_by_stores(_uuid, int4, int4);

CREATE OR REPLACE FUNCTION public.fun_get_shop_products_by_stores(store_ids uuid[], limit_count integer DEFAULT 10, offset_count integer DEFAULT 0)
 RETURNS TABLE(shop_product_id uuid, product_name text, description text, price numeric, discount integer, stock integer, reviews integer, product_size text, shop_created_at timestamp without time zone, shop_updated_at timestamp without time zone, store_id uuid, store_name text, store_address text, store_logo text, store_created_at timestamp without time zone, store_updated_at timestamp without time zone, images text[], total_count bigint)
 LANGUAGE sql
AS $function$
  SELECT
    sp.id AS shop_product_id,
    p.product_name,
    p.description,
    sp.price,
    sp.discount,
    sp.stock,
    sp.reviews,
    p.product_size,
    sp.created_at AS shop_created_at,
    sp.updated_at AS shop_updated_at,
    s.id AS store_id,
    s.store_name,
    s.store_address,
    s.store_logo,
    s."created_at" AS store_created_at,
    s."updated_at" AS store_updated_at,
    COALESCE(
      array_agg(DISTINCT i.url) FILTER (WHERE i.is_deleted = false),
      '{}'
    ) AS images,
    COUNT(*) OVER() AS total_count
  FROM shop_product sp
  JOIN products p ON sp.product_id = p.id
  JOIN stores s ON sp.store_id = s.id
  LEFT JOIN product_images i ON i.product_id = p.id
  WHERE p.is_deleted = false
    AND p.is_active = true
    AND p.status = 'approved'::products_status_enum
    AND s.id = ANY(store_ids)
  GROUP BY sp.id, p.product_name, p.description, sp.price, p.product_size,
           sp.created_at, sp.updated_at,
           s.id, s.store_name, s.store_address, s.store_logo, s."created_at", s."updated_at"
  ORDER BY RANDOM()
  LIMIT limit_count
  OFFSET offset_count;
$function$
;

-- Permissions

ALTER FUNCTION public.fun_get_shop_products_by_stores(_uuid, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.fun_get_shop_products_by_stores(_uuid, int4, int4) TO public;
GRANT ALL ON FUNCTION public.fun_get_shop_products_by_stores(_uuid, int4, int4) TO postgres;
GRANT ALL ON FUNCTION public.fun_get_shop_products_by_stores(_uuid, int4, int4) TO anon;
GRANT ALL ON FUNCTION public.fun_get_shop_products_by_stores(_uuid, int4, int4) TO authenticated;
GRANT ALL ON FUNCTION public.fun_get_shop_products_by_stores(_uuid, int4, int4) TO service_role;

-- DROP FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4);

CREATE OR REPLACE FUNCTION public.fun_search_shop_products(search_term text DEFAULT ''::text, p_category_id uuid DEFAULT NULL::uuid, p_store_ids uuid[] DEFAULT NULL::uuid[], limit_count integer DEFAULT 10)
 RETURNS TABLE(shop_product_id uuid, product_name text, description text, price numeric, discount integer, stock integer, reviews integer, product_size text, shop_created_at timestamp without time zone, shop_updated_at timestamp without time zone, store_id uuid, store_name text, store_address text, store_logo text, store_created_at timestamp without time zone, store_updated_at timestamp without time zone, category_id uuid, category_name text, category_image text, category_created_at timestamp without time zone, category_updated_at timestamp without time zone, images text[])
 LANGUAGE sql
AS $function$
  SELECT
    sp.id AS shop_product_id,
    p.product_name,
    p.description,
    sp.price,
    sp.discount,
    sp.stock,
    sp.reviews,
    p.product_size,
    sp.created_at AS shop_created_at,
    sp.updated_at AS shop_updated_at,
    s.id AS store_id,
    s.store_name,
    s.store_address,
    s.store_logo,
    s.created_at AS store_created_at,
    s.updated_at AS store_updated_at,
    c.id AS category_id,
    c.category_name,
    c.category_image,
    c.created_at AS category_created_at,
    c.updated_at AS category_updated_at,
    COALESCE(
      array_agg(DISTINCT i.url) FILTER (WHERE i.is_deleted = false),
      '{}'
    ) AS images
  FROM shop_product sp
  JOIN products p ON sp.product_id = p.id
  JOIN stores s ON sp.store_id = s.id
  JOIN category c ON p.category_id = c.id
  LEFT JOIN product_images i ON i.product_id = p.id
  WHERE p.is_deleted = false
    AND p.is_active = true
    AND p.status = 'approved'::products_status_enum

    -- Filter by category (optional)
    AND (p_category_id IS NULL OR p.category_id = p_category_id)

    -- Filter by array of store_ids (optional)
    AND (p_store_ids IS NULL OR s.id = ANY(p_store_ids))
    AND (
      search_term = ''
      OR (
        to_tsvector('english', coalesce(p.product_name,'') || ' ' || coalesce(p.description,'')) @@ plainto_tsquery('english', search_term)
        OR p.product_name ILIKE '%' || search_term || '%'
        OR p.description ILIKE '%' || search_term || '%'
      )
    )

  GROUP BY sp.id, p.product_name, p.description, sp.price, sp.discount, sp.stock,
           p.product_size, sp.created_at, sp.updated_at,
           s.id, s.store_name, s.store_address, s.store_logo, s.created_at, s.updated_at,
           c.id, c.category_name, c.category_image, c.created_at, c.updated_at
  ORDER BY p.product_name ASC
  LIMIT limit_count;
$function$
;

-- Permissions

ALTER FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4) TO public;
GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4) TO service_role;

-- DROP FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4, int4);

CREATE OR REPLACE FUNCTION public.fun_search_shop_products(search_term text DEFAULT ''::text, p_category_id uuid DEFAULT NULL::uuid, p_store_ids uuid[] DEFAULT NULL::uuid[], limit_count integer DEFAULT 10, offset_count integer DEFAULT 0)
 RETURNS TABLE(shop_product_id uuid, product_name text, description text, price numeric, discount integer, stock integer, reviews integer, product_size text, shop_created_at timestamp without time zone, shop_updated_at timestamp without time zone, store_id uuid, store_name text, store_address text, store_logo text, store_created_at timestamp without time zone, store_updated_at timestamp without time zone, category_id uuid, category_name text, category_image text, category_created_at timestamp without time zone, category_updated_at timestamp without time zone, images text[], total_count bigint)
 LANGUAGE sql
AS $function$
  SELECT
    sp.id AS shop_product_id,
    p.product_name,
    p.description,
    sp.price,
    sp.discount,
    sp.stock,
    sp.reviews,
    p.product_size,
    sp.created_at AS shop_created_at,
    sp.updated_at AS shop_updated_at,
    s.id AS store_id,
    s.store_name,
    s.store_address,
    s.store_logo,
    s.created_at AS store_created_at,
    s.updated_at AS store_updated_at,
    c.id AS category_id,
    c.category_name,
    c.category_image,
    c.created_at AS category_created_at,
    c.updated_at AS category_updated_at,
    COALESCE(
      array_agg(DISTINCT i.url) FILTER (WHERE i.is_deleted = false),
      '{}'
    ) AS images,
    COUNT(*) OVER() AS total_count
  FROM shop_product sp
  JOIN products p ON sp.product_id = p.id
  JOIN stores s ON sp.store_id = s.id
  JOIN category c ON p.category_id = c.id
  LEFT JOIN product_images i ON i.product_id = p.id
  WHERE p.is_deleted = false
    AND p.is_active = true
    AND p.status = 'approved'::products_status_enum
    -- Filter by category (optional)
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    -- Filter by array of store_ids (optional)
    AND (p_store_ids IS NULL OR s.id = ANY(p_store_ids))
    AND (
      search_term = ''
      OR (
        to_tsvector('english', coalesce(p.product_name,'') || ' ' || coalesce(p.description,'')) @@ plainto_tsquery('english', search_term)
        OR p.product_name ILIKE '%' || search_term || '%'
        OR p.description ILIKE '%' || search_term || '%'
      )
    )
  GROUP BY sp.id, p.product_name, p.description, sp.price, sp.discount, sp.stock,
           p.product_size, sp.created_at, sp.updated_at,
           s.id, s.store_name, s.store_address, s.store_logo, s.created_at, s.updated_at,
           c.id, c.category_name, c.category_image, c.created_at, c.updated_at
  ORDER BY p.product_name ASC
  LIMIT limit_count
  OFFSET offset_count;
$function$
;

-- Permissions

-- ALTER FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4, int4) OWNER TO postgres;
-- GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4, int4) TO public;
-- GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4, int4) TO postgres;
-- GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4, int4) TO anon;
-- GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4, int4) TO authenticated;
-- GRANT ALL ON FUNCTION public.fun_search_shop_products(text, uuid, _uuid, int4, int4) TO service_role;

-- DROP FUNCTION public.fun_get_store_categories(_uuid);

CREATE OR REPLACE FUNCTION public.fun_get_store_categories(p_store_ids uuid[])
 RETURNS TABLE(category_id uuid, category_name text, category_image text, category_created_at timestamp without time zone, category_updated_at timestamp without time zone, product_count bigint)
 LANGUAGE sql
AS $function$
  SELECT
    c.id AS category_id,
    c.category_name,
    c.category_image,
    c.created_at AS category_created_at,
    c.updated_at AS category_updated_at,
    COUNT(DISTINCT sp.id) AS product_count
  FROM category c
  JOIN products p ON p.category_id = c.id
  JOIN shop_product sp ON sp.product_id = p.id
  WHERE sp.store_id = ANY(p_store_ids)
    AND p.is_deleted = false
    AND p.is_active = true
    AND p.status = 'approved'::products_status_enum
    AND sp.is_deleted = false
    AND sp.is_available = true
    AND sp.stock > 0
  GROUP BY c.id, c.category_name, c.category_image, c.created_at, c.updated_at
  ORDER BY c.category_name ASC;
$function$
;

-- Permissions

-- ALTER FUNCTION public.fun_get_store_categories(uuid) OWNER TO postgres;
-- GRANT ALL ON FUNCTION public.fun_get_store_categories(uuid) TO public;
-- GRANT ALL ON FUNCTION public.fun_get_store_categories(uuid) TO postgres;
-- GRANT ALL ON FUNCTION public.fun_get_store_categories(uuid) TO anon;
-- GRANT ALL ON FUNCTION public.fun_get_store_categories(uuid) TO authenticated;
-- GRANT ALL ON FUNCTION public.fun_get_store_categories(uuid) TO service_role;

-- DROP FUNCTION public.fun_get_store_products(uuid, int4, int4);

CREATE OR REPLACE FUNCTION public.fun_get_store_products(p_store_id uuid, limit_count integer DEFAULT 10, offset_count integer DEFAULT 0)
 RETURNS TABLE(shop_product_id uuid, product_name text, description text, price numeric, discount integer, stock integer, reviews integer, product_size text, shop_created_at timestamp without time zone, shop_updated_at timestamp without time zone, category_id uuid, category_name text, category_image text, images text[], total_count bigint)
 LANGUAGE sql
AS $function$
  SELECT
    sp.id AS shop_product_id,
    p.product_name,
    p.description,
    sp.price,
    sp.discount,
    sp.stock,
    sp.reviews,
    p.product_size,
    sp.created_at AS shop_created_at,
    sp.updated_at AS shop_updated_at,
    c.id AS category_id,
    c.category_name,
    c.category_image,
    COALESCE(
      array_agg(DISTINCT i.url) FILTER (WHERE i.is_deleted = false),
      '{}'
    ) AS images,
    COUNT(*) OVER() AS total_count
  FROM shop_product sp
  JOIN products p ON sp.product_id = p.id
  JOIN category c ON p.category_id = c.id
  LEFT JOIN product_images i ON i.product_id = p.id
  WHERE sp.store_id = p_store_id
    AND p.is_deleted = false
    AND p.is_active = true
    AND p.status = 'approved'::products_status_enum
    AND sp.is_deleted = false
    AND sp.is_available = true
    AND sp.stock > 0
  GROUP BY sp.id, p.product_name, p.description, sp.price, sp.discount, sp.stock,
           sp.reviews, p.product_size, sp.created_at, sp.updated_at,
           c.id, c.category_name, c.category_image
  ORDER BY p.product_name ASC
  LIMIT limit_count
  OFFSET offset_count;
$function$
;

-- Permissions

-- ALTER FUNCTION public.fun_get_store_products(uuid, int4, int4) OWNER TO postgres;
-- GRANT ALL ON FUNCTION public.fun_get_store_products(uuid, int4, int4) TO public;
-- GRANT ALL ON FUNCTION public.fun_get_store_products(uuid, int4, int4) TO postgres;
-- GRANT ALL ON FUNCTION public.fun_get_store_products(uuid, int4, int4) TO anon;
-- GRANT ALL ON FUNCTION public.fun_get_store_products(uuid, int4, int4) TO authenticated;
-- GRANT ALL ON FUNCTION public.fun_get_store_products(uuid, int4, int4) TO service_role;

-- DROP FUNCTION public.fun_search_store_products(_uuid, uuid, text, int4, int4);

CREATE OR REPLACE FUNCTION public.fun_search_store_products(p_store_ids uuid[], p_category_id uuid DEFAULT NULL::uuid, search_term text DEFAULT ''::text, limit_count integer DEFAULT 10, offset_count integer DEFAULT 0)
 RETURNS TABLE(shop_product_id uuid, product_name text, description text, price numeric, discount integer, stock integer, reviews integer, product_size text, shop_created_at timestamp without time zone, shop_updated_at timestamp without time zone, category_id uuid, category_name text, category_image text, images text[], total_count bigint)
 LANGUAGE sql
AS $function$
  SELECT
    sp.id AS shop_product_id,
    p.product_name,
    p.description,
    sp.price,
    sp.discount,
    sp.stock,
    sp.reviews,
    p.product_size,
    sp.created_at AS shop_created_at,
    sp.updated_at AS shop_updated_at,
    c.id AS category_id,
    c.category_name,
    c.category_image,
    COALESCE(
      array_agg(DISTINCT i.url) FILTER (WHERE i.is_deleted = false),
      '{}'
    ) AS images,
    COUNT(*) OVER() AS total_count
  FROM shop_product sp
  JOIN products p ON sp.product_id = p.id
  JOIN category c ON p.category_id = c.id
  LEFT JOIN product_images i ON i.product_id = p.id
  WHERE (p_store_ids IS NULL OR sp.store_id = ANY(p_store_ids))
    AND p.is_deleted = false
    AND p.is_active = true
    AND p.status = 'approved'::products_status_enum
    AND sp.is_deleted = false
    AND sp.is_available = true
    AND sp.stock > 0
    -- Filter by category (optional)
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    -- Search by product name or description (optional)
    AND (
      search_term = ''
      OR (
        to_tsvector('english', coalesce(p.product_name,'') || ' ' || coalesce(p.description,'')) @@ plainto_tsquery('english', search_term)
        OR p.product_name ILIKE '%' || search_term || '%'
        OR p.description ILIKE '%' || search_term || '%'
      )
    )
  GROUP BY sp.id, p.product_name, p.description, sp.price, sp.discount, sp.stock,
           sp.reviews, p.product_size, sp.created_at, sp.updated_at,
           c.id, c.category_name, c.category_image
  ORDER BY p.product_name ASC
  LIMIT limit_count
  OFFSET offset_count;
$function$
;

-- Permissions

-- ALTER FUNCTION public.fun_search_store_products(uuid, uuid, text, int4, int4) OWNER TO postgres;
-- GRANT ALL ON FUNCTION public.fun_search_store_products(uuid, uuid, text, int4, int4) TO public;
-- GRANT ALL ON FUNCTION public.fun_search_store_products(uuid, uuid, text, int4, int4) TO postgres;
-- GRANT ALL ON FUNCTION public.fun_search_store_products(uuid, uuid, text, int4, int4) TO anon;
-- GRANT ALL ON FUNCTION public.fun_search_store_products(uuid, uuid, text, int4, int4) TO authenticated;
-- GRANT ALL ON FUNCTION public.fun_search_store_products(uuid, uuid, text, int4, int4) TO service_role;