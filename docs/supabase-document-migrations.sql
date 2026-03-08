-- Supabase Document Management System — Migrations
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- Prerequisite: users table exists with id, role ('coach'|'trainee')
-- Use UUID if users.id is UUID; use TEXT if users.id is TEXT (e.g. coach_1)

-- ============================================================
-- 1. Documents table
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_coach ON documents(coach_id);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

-- ============================================================
-- 2. Document assignments (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(document_id, trainee_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_document ON document_assignments(document_id);
CREATE INDEX IF NOT EXISTS idx_assignments_trainee ON document_assignments(trainee_id);

-- ============================================================
-- 3. Row Level Security — Documents
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coaches manage own documents" ON documents;
CREATE POLICY "Coaches manage own documents"
  ON documents FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- ============================================================
-- 4. Row Level Security — Document assignments
-- ============================================================
ALTER TABLE document_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coaches manage assignments for own documents" ON document_assignments;
CREATE POLICY "Coaches manage assignments for own documents"
  ON document_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_assignments.document_id
      AND d.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_assignments.document_id
      AND d.coach_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Trainees view own assignments" ON document_assignments;
CREATE POLICY "Trainees view own assignments"
  ON document_assignments FOR SELECT
  USING (trainee_id = auth.uid());

-- ============================================================
-- 5. Storage bucket (run via Supabase Dashboard or API)
-- ============================================================
-- In Supabase Dashboard: Storage > New bucket
-- Name: trainee-documents
-- Public: OFF (private)
-- Allowed MIME: application/pdf, application/msword, 
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--   text/plain

-- Storage RLS policies (if using Supabase Auth):
-- Policy: "Coaches upload to own folder"
-- INSERT: (bucket_id = 'trainee-documents') AND 
--   (storage.foldername(name))[1] = auth.uid()::text
