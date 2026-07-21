
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "public insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "public update categories" ON public.categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete categories" ON public.categories FOR DELETE USING (true);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  description TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete products" ON public.products FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

INSERT INTO public.categories (name) VALUES
  ('Stitched Suits'),
  ('Formal Wear'),
  ('Casual Wear'),
  ('Bridal Collection');
