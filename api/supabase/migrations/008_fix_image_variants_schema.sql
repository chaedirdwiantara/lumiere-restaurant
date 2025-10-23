-- Fix image_variants table schema inconsistencies
-- Ensure proper foreign key relationship with gallery_images

-- First, check current column name and fix if needed
DO $$
BEGIN
    -- Check if image_id column exists (from migration 002)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'image_variants' 
        AND column_name = 'image_id'
        AND table_schema = 'public'
    ) THEN
        -- Rename image_id back to gallery_image_id to match backend expectations
        ALTER TABLE image_variants RENAME COLUMN image_id TO gallery_image_id;
    END IF;
    
    -- Ensure gallery_image_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'image_variants' 
        AND column_name = 'gallery_image_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE image_variants ADD COLUMN gallery_image_id UUID;
    END IF;
END $$;

-- Drop existing foreign key constraint if it exists
ALTER TABLE image_variants 
DROP CONSTRAINT IF EXISTS image_variants_gallery_image_id_fkey;

ALTER TABLE image_variants 
DROP CONSTRAINT IF EXISTS image_variants_image_id_fkey;

-- Add proper foreign key constraint
ALTER TABLE image_variants 
ADD CONSTRAINT image_variants_gallery_image_id_fkey 
FOREIGN KEY (gallery_image_id) REFERENCES gallery_images(id) ON DELETE CASCADE;

-- Ensure all required columns exist in image_variants
ALTER TABLE image_variants 
ADD COLUMN IF NOT EXISTS variant_type VARCHAR(50) NOT NULL DEFAULT 'original',
ADD COLUMN IF NOT EXISTS url VARCHAR(500),
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS format VARCHAR(20) DEFAULT 'jpeg';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_variants_gallery_image_id ON image_variants(gallery_image_id);
CREATE INDEX IF NOT EXISTS idx_image_variants_variant_type ON image_variants(variant_type);

-- Grant proper permissions
GRANT SELECT ON image_variants TO anon;
GRANT ALL PRIVILEGES ON image_variants TO authenticated;

-- Migration completed successfully