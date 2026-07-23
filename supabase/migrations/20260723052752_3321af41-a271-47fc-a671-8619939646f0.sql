
-- Permissive storage policies for product-images bucket (user explicit request)
DROP POLICY IF EXISTS "product-images public read" ON storage.objects;
DROP POLICY IF EXISTS "product-images public write" ON storage.objects;
DROP POLICY IF EXISTS "product-images public update" ON storage.objects;
DROP POLICY IF EXISTS "product-images public delete" ON storage.objects;

CREATE POLICY "product-images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product-images public write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product-images public update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product-images public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');
