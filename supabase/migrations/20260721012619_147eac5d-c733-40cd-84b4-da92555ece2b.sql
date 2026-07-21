
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT ARRAY['S','M','L','XL','XXL']::text[];

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  qty integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, size)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO anon, authenticated;
GRANT ALL ON public.cart_items TO service_role;

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read cart" ON public.cart_items FOR SELECT USING (true);
CREATE POLICY "public insert cart" ON public.cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "public update cart" ON public.cart_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete cart" ON public.cart_items FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
