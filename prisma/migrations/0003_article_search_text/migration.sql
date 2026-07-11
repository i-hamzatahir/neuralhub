-- Add searchable plain-text column for PostgreSQL full-text search
ALTER TABLE "Article" ADD COLUMN "searchText" TEXT;

-- GIN index for English full-text search
CREATE INDEX "Article_searchText_fts_idx" ON "Article"
USING GIN (to_tsvector('english', COALESCE("searchText", '')));
