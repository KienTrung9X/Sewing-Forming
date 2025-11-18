-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true);

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

-- Allow public uploads
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images');

-- Allow public delete
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-images');
