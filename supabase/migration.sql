-- ==============================================================================
-- DOCUMATCH AI: COMPLETE CONSOLIDATED POSTGRESQL & SUPABASE MIGRATION
-- File Location: supabase/migration.sql
-- Safe to execute as a single idempotent migration in the Supabase SQL Editor.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS & TRIGGERS
-- Automatic updated_at timestamp refresher
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. USER PROFILES TABLE
-- Mirrors auth.users metadata into public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically create a profile row whenever a user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. DOCUMENTS TABLE
-- Stores uploaded document metadata, text extracts, SHA-256 fingerprints, and classifications
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'docx', 'txt'
    file_size BIGINT NOT NULL,
    content_hash TEXT NOT NULL, -- Cryptographic SHA-256 fingerprint
    extracted_text TEXT,
    word_count INT DEFAULT 0,
    character_count INT DEFAULT 0,
    status TEXT DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'error'
    classification TEXT DEFAULT 'unique', -- 'exact_duplicate', 'near_duplicate', 'unique'
    duplicate_of_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    highest_similarity_score NUMERIC DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS set_documents_updated_at ON public.documents;
CREATE TRIGGER set_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. ANALYSIS JOBS TABLE
-- Records batch comparison jobs, progress, parameters, and findings
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'completed', -- 'running', 'completed', 'failed'
    total_documents INT DEFAULT 0,
    exact_duplicates_count INT DEFAULT 0,
    near_duplicates_count INT DEFAULT 0,
    unique_count INT DEFAULT 0,
    similarity_threshold NUMERIC DEFAULT 0.70,
    summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. DOCUMENT SIMILARITIES TABLE
-- Pairwise relationship graph connecting source and target documents
CREATE TABLE IF NOT EXISTS public.document_similarities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    target_doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    similarity_score NUMERIC NOT NULL, -- 0.000 to 1.000
    relationship_type TEXT NOT NULL, -- 'exact_duplicate', 'near_duplicate', 'low_similarity'
    matching_ngrams_count INT DEFAULT 0,
    common_terms JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_job_document_pair UNIQUE (job_id, source_doc_id, target_doc_id)
);

-- 7. ANALYSIS HISTORY AUDIT TABLE
-- Detailed chronological audit trail of all repository actions and analyses
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'batch_analysis', 'manual_compare', 'document_purged', 'library_sync'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON public.documents(user_id, content_hash);
CREATE INDEX IF NOT EXISTS idx_documents_classification ON public.documents(user_id, classification);
CREATE INDEX IF NOT EXISTS idx_similarities_job ON public.document_similarities(job_id);
CREATE INDEX IF NOT EXISTS idx_similarities_pair ON public.document_similarities(source_doc_id, target_doc_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON public.analysis_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user ON public.analysis_history(user_id, created_at DESC);

-- 9. PERMISSIONS & SCHEMA GRANTS
-- Grants table-level privileges to Supabase client roles so RLS policies can take effect
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.documents TO authenticated;
GRANT ALL ON TABLE public.analysis_jobs TO authenticated;
GRANT ALL ON TABLE public.document_similarities TO authenticated;
GRANT ALL ON TABLE public.analysis_history TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation ensuring users only see and manage their own documents and results
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_similarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can read own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can manage own analysis jobs" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Users can manage own similarities" ON public.document_similarities;
DROP POLICY IF EXISTS "Users can manage own history" ON public.analysis_history;

-- Profiles RLS
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Documents RLS
CREATE POLICY "Users can read own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Analysis Jobs RLS
CREATE POLICY "Users can manage own analysis jobs" ON public.analysis_jobs
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Document Similarities RLS
CREATE POLICY "Users can manage own similarities" ON public.document_similarities
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Analysis History RLS
CREATE POLICY "Users can manage own history" ON public.analysis_history
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. PRIVATE SUPABASE STORAGE BUCKET: 'documents'
-- Creates the private storage bucket for uploaded original document binaries
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, -- Private bucket
    52428800, -- 50 MB limit
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

-- Storage Row Level Security Policies
-- Users can only upload, read, and delete within their own tenant folder: <user_id>/<filename>
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

CREATE POLICY "Users can upload their own documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can read their own documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 11. COMPLETION VERIFICATION
SELECT 'DocuMatch AI consolidated migration completed successfully' AS status;
