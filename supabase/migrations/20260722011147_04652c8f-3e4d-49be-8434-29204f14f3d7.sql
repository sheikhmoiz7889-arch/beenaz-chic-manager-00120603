
-- Drop overly-permissive public write policies
DROP POLICY IF EXISTS "public delete cart" ON public.cart_items;
DROP POLICY IF EXISTS "public insert cart" ON public.cart_items;
DROP POLICY IF EXISTS "public read cart" ON public.cart_items;
DROP POLICY IF EXISTS "public update cart" ON public.cart_items;

DROP POLICY IF EXISTS "public delete categories" ON public.categories;
DROP POLICY IF EXISTS "public insert categories" ON public.categories;
DROP POLICY IF EXISTS "public read categories" ON public.categories;
DROP POLICY IF EXISTS "public update categories" ON public.categories;

DROP POLICY IF EXISTS "public delete products" ON public.products;
DROP POLICY IF EXISTS "public insert products" ON public.products;
DROP POLICY IF EXISTS "public read products" ON public.products;
DROP POLICY IF EXISTS "public update products" ON public.products;

-- Public read-only. Writes require service_role (server-side only).
CREATE POLICY "read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read products"   ON public.products   FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read cart"       ON public.cart_items FOR SELECT TO anon, authenticated USING (true);

-- Ensure service_role has full access (bypasses RLS but explicit grants make intent clear)
GRANT SELECT ON public.categories, public.products, public.cart_items TO anon, authenticated;
GRANT ALL ON public.categories, public.products, public.cart_items TO service_role;
