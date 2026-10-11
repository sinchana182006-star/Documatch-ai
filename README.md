# DocuMatch AI — Intelligent Document Similarity & Duplicate Finder

DocuMatch AI is an enterprise document intelligence and deduplication SaaS application built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth & Private Storage)**.

---

## Key Features

1. **Multi-Format Text Extraction**
   - Direct extraction of textual content from **PDF**, **DOCX**, and **TXT** documents.
   - Text normalization: lowercase conversion, whitespace collapsing, punctuation filtering.

2. **Cryptographic SHA-256 Fingerprinting**
   - Exact duplicates are detected instantly using cryptographic SHA-256 hashes.
   - 100% duplicate accuracy regardless of file names or directory paths.

3. **TF-IDF & Cosine Similarity Engine**
   - Term frequency and inverse document frequency (TF-IDF) vectorizer.
   - Pairwise cosine distance calculation.
   - 3-gram linguistic shingling (Jaccard phrasing match).
   - Configurable sensitivity threshold (default 70% for near-duplicates).

4. **Interactive Similarity Network Map**
   - Spatial node-graph visualizing document clusters.
   - Line thickness and opacity reflect similarity score.
   - Interactive node and edge selection with direct compare shortcuts.

5. **Side-by-Side Comparison Workspace**
   - Word-level text diffing highlighting additions (green), removals (red), and identical paragraphs.
   - Detailed metadata inspection (SHA-256 hash, word count, character count).

6. **Secure Developer-Configured Supabase Architecture**
   - **Supabase Auth**: Email/password registration, login, and secure sessions.
   - **Supabase Storage**: Private `documents` bucket restricted with Row Level Security.
   - **PostgreSQL Database**: Single consolidated idempotent SQL migration for `profiles`, `documents`, `analysis_jobs`, `document_similarities`, and `analysis_history`.
   - **Zero Visitor Friction**: Public users can register, sign in, upload documents, and run analysis seamlessly without seeing database credentials or configuration dialogs.

---

## Developer Configuration

### 1. Environment Variables
To connect your production or staging Supabase backend, configure the following variables in `.env`:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### 2. Consolidated Database Migration
Run the consolidated SQL migration in your **Supabase SQL Editor**:
1. Open your Supabase Dashboard: `https://supabase.com/dashboard/project/<your-project-id>/sql`
2. Open `supabase/migration.sql`.
3. Paste the script and click **Run**.

The migration sets up:
- `public.profiles` with `handle_new_user()` trigger on `auth.users`.
- `public.documents` with SHA-256 content hashes, extracted text, and metadata.
- `public.analysis_jobs` tracking batch deduplication tasks.
- `public.document_similarities` storing pairwise cosine scores.
- `public.analysis_history` audit trail.
- Private Storage bucket `documents` (50MB limit, PDF/DOCX/TXT).
- Row Level Security (RLS) policies enforcing `auth.uid() = user_id`.

---

## Testing & Sample Data
The application includes 5 pre-configured document fixtures:
- `Mutual_NDA_Standard_2026.txt`
- `Mutual_NDA_Standard_2026_ExactCopy.txt` (Exact 100% SHA-256 duplicate)
- `Mutual_NDA_Standard_2026_Revised_v2.txt` (Near duplicate ~85% similarity)
- `Master_Services_Agreement_Cloud.txt` (Moderate topical overlap ~40%)
- `Infrastructure_Invoice_INV-98214.txt` (Unique financial document <5%)

Click **"Load 5 Test Samples"** on the Upload page to immediately test the duplicate detection engine.

---

## License
Apache-2.0
