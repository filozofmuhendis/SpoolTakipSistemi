-- Ürün Alt Kalemi Takip Sistemi - Storage Konfigürasyonu
-- Bu dosya Supabase Storage bucket'larını ve politikalarını içerir

-- ========================================
-- STORAGE BUCKETS
-- ========================================

-- Ana dosya yükleme bucket'ı
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'uploads', 
  'uploads', 
  true, 
  52428800, -- 50MB limit
  ARRAY[
    'image/*', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Profil fotoğrafları için bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Proje belgeleri için bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'project-docs', 
  'project-docs', 
  false, 
  104857600, -- 100MB limit
  ARRAY[
    'image/*', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Ürün alt kalemi belgeleri için bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'urun-alt-kalemi-docs', 
  'urun-alt-kalemi-docs', 
  false, 
  104857600, -- 100MB limit
  ARRAY[
    'image/*', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Kalite kontrol belgeleri için bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'quality-control', 
  'quality-control', 
  false, 
  52428800, -- 50MB limit
  ARRAY[
    'image/*', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STORAGE POLICIES
-- ========================================

-- Uploads bucket policies
CREATE POLICY "Public Access to Uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars bucket policies
CREATE POLICY "Public Access to Avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Project docs bucket policies
CREATE POLICY "Authenticated users can view project docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-docs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload project docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-docs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update project docs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-docs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete project docs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-docs' AND 
    auth.role() = 'authenticated'
  );

-- Ürün alt kalemi docs bucket policies
CREATE POLICY "Authenticated users can view urun alt kalemi docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'urun-alt-kalemi-docs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload urun alt kalemi docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'urun-alt-kalemi-docs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update urun alt kalemi docs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'urun-alt-kalemi-docs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete urun alt kalemi docs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'urun-alt-kalemi-docs' AND 
    auth.role() = 'authenticated'
  );

-- Quality control bucket policies
CREATE POLICY "Authenticated users can view quality control docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'quality-control' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload quality control docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'quality-control' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update quality control docs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'quality-control' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete quality control docs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'quality-control' AND 
    auth.role() = 'authenticated'
  );

-- ========================================
-- STORAGE FUNCTIONS
-- ========================================

-- Function to get file URL
CREATE OR REPLACE FUNCTION get_file_url(bucket_name text, file_path text)
RETURNS text AS $$
BEGIN
  RETURN storage.url(bucket_name, file_path);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access file
CREATE OR REPLACE FUNCTION can_access_file(bucket_name text, file_path text)
RETURNS boolean AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.role() != 'authenticated' THEN
    RETURN false;
  END IF;
  
  -- Allow access to public buckets
  IF bucket_name IN ('uploads', 'avatars') THEN
    RETURN true;
  END IF;
  
  -- For private buckets, check if user has access
  -- This can be customized based on your business logic
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STORAGE TRIGGERS
-- ========================================

-- Function to log file uploads
CREATE OR REPLACE FUNCTION log_file_upload()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO file_uploads (
    file_name,
    file_path,
    file_size,
    mime_type,
    entity_type,
    entity_id,
    uploaded_by,
    description
  ) VALUES (
    NEW.name,
    NEW.id,
    NEW.metadata->>'size',
    NEW.metadata->>'mimetype',
    'file',
    NEW.id,
    auth.uid(),
    'Dosya yüklendi'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log file uploads
CREATE TRIGGER on_file_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION log_file_upload();

-- ========================================
-- STORAGE COMMENTS
-- ========================================

COMMENT ON FUNCTION get_file_url IS 'Dosya URL''sini döndürür';
COMMENT ON FUNCTION can_access_file IS 'Kullanıcının dosyaya erişim yetkisini kontrol eder';
COMMENT ON FUNCTION log_file_upload IS 'Dosya yüklemelerini loglar'; 