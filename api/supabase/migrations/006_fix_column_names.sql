-- Fix column names to match backend expectations

-- Update gallery_images table
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing sort_order to display_order
UPDATE gallery_images SET display_order = sort_order WHERE display_order = 0;

-- Update home_content table  
ALTER TABLE home_content 
ADD COLUMN IF NOT EXISTS section_key VARCHAR(100);

-- Update existing section to section_key
UPDATE home_content SET section_key = section WHERE section_key IS NULL;

-- Make section_key unique
ALTER TABLE home_content 
ADD CONSTRAINT unique_section_key UNIQUE (section_key);

-- Update indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_display_order ON gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_home_content_section_key ON home_content(section_key);

-- Update image_variants table to match expected column names
ALTER TABLE image_variants 
RENAME COLUMN image_id TO gallery_image_id;

-- Update foreign key constraint
ALTER TABLE image_variants 
DROP CONSTRAINT IF EXISTS image_variants_image_id_fkey;

ALTER TABLE image_variants 
ADD CONSTRAINT image_variants_gallery_image_id_fkey 
FOREIGN KEY (gallery_image_id) REFERENCES gallery_images(id) ON DELETE CASCADE;

-- Update index
DROP INDEX IF EXISTS idx_image_variants_image_id;
CREATE INDEX IF NOT EXISTS idx_image_variants_gallery_image_id ON image_variants(gallery_image_id);

-- Update gallery_images table column names to match backend
ALTER TABLE gallery_images 
RENAME COLUMN public_url TO original_url;

-- Add missing columns that backend expects
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS url VARCHAR(500);

-- Copy original_url to url for backward compatibility
UPDATE gallery_images SET url = original_url WHERE url IS NULL;

-- Update image_variants table
ALTER TABLE image_variants 
RENAME COLUMN public_url TO url;

-- Add variant_type column if it doesn't exist (rename from variant_type if needed)
-- This should already exist, but let's make sure
ALTER TABLE image_variants 
ADD COLUMN IF NOT EXISTS variant_type VARCHAR(50) DEFAULT 'original';

-- Add format column if missing
ALTER TABLE image_variants 
ADD COLUMN IF NOT EXISTS format VARCHAR(20) DEFAULT 'jpeg';

-- Update format based on mime_type from gallery_images
UPDATE image_variants 
SET format = CASE 
    WHEN gi.mime_type LIKE '%jpeg%' THEN 'jpeg'
    WHEN gi.mime_type LIKE '%png%' THEN 'png'
    WHEN gi.mime_type LIKE '%webp%' THEN 'webp'
    ELSE 'jpeg'
END
FROM gallery_images gi 
WHERE image_variants.gallery_image_id = gi.id AND image_variants.format = 'jpeg';