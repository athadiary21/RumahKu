-- Create storage bucket for vault documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-documents', 'vault-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for vault-documents bucket
CREATE POLICY "Users can upload documents to their family folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vault-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT family_id::text FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view documents in their family folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vault-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT family_id::text FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents in their family folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vault-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT family_id::text FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Add missing columns to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_size bigint;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS description text;