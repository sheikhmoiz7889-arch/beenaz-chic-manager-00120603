
-- Enable RLS on products; public reads already exist, writes now blocked from anon
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop insecure storage policies (public uploads to any/all buckets)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to all buckets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing from all buckets" ON storage.objects;
DROP POLICY IF EXISTS "product-images public write" ON storage.objects;
DROP POLICY IF EXISTS "product-images public update" ON storage.objects;
DROP POLICY IF EXISTS "product-images public delete" ON storage.objects;

-- Keep only public read on product-images so <img> tags load;
-- writes go through server-side service role after admin password check.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
      AND policyname='product-images public read'
  ) THEN
    CREATE POLICY "product-images public read" ON storage.objects
      FOR SELECT TO public USING (bucket_id = 'product-images');
  END IF;
END $$;
