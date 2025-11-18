-- Storage policies for report-images bucket
-- Run this in SQL Editor after creating the bucket

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

-- Allow authenticated uploads
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images');

-- Allow delete
CREATE POLICY "Allow delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-images');
