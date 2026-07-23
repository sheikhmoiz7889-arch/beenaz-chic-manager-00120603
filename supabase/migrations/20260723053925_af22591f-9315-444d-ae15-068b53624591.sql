
-- Allow public writes on catalog + cart tables and product-images storage bucket.
CREATE POLICY "public insert categories" ON public.categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update categories" ON public.categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete categories" ON public.categories FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public insert products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update products" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete products" ON public.products FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public insert cart" ON public.cart_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update cart" ON public.cart_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete cart" ON public.cart_items FOR DELETE TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO anon, authenticated;

-- Storage: allow public upload/read/update/delete on product-images bucket
CREATE POLICY "product-images public insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product-images public update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product-images public delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'product-images');
