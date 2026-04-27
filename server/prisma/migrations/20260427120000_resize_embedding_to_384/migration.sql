-- Resize embedding column for self-hosted TEI (BAAI/bge-small-en-v1.5 = 384 dim)
ALTER TABLE "Story" DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "Story" ADD COLUMN "embedding" vector(384);
