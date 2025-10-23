-- Fix gallery_images table to match API requirements
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS storage_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS public_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Rename columns to match API expectations
ALTER TABLE gallery_images 
RENAME COLUMN original_url TO public_url_old;

-- Update gallery_images to use public_url instead of original_url
UPDATE gallery_images SET public_url = public_url_old WHERE public_url IS NULL;

-- Drop the old column
ALTER TABLE gallery_images DROP COLUMN IF EXISTS public_url_old;

-- Rename display_order to sort_order if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_images' AND column_name = 'display_order') THEN
        ALTER TABLE gallery_images RENAME COLUMN display_order TO sort_order_old;
        UPDATE gallery_images SET sort_order = sort_order_old WHERE sort_order IS NULL;
        ALTER TABLE gallery_images DROP COLUMN sort_order_old;
    END IF;
END $$;

-- Fix image_variants table to match API requirements
ALTER TABLE image_variants 
RENAME COLUMN gallery_image_id TO image_id;

ALTER TABLE image_variants 
ADD COLUMN IF NOT EXISTS storage_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS public_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS quality INTEGER DEFAULT 80;

-- Update image_variants to use public_url
UPDATE image_variants SET public_url = url WHERE public_url IS NULL;

-- Fix home_content table to match API requirements
ALTER TABLE home_content 
RENAME COLUMN section_key TO section;

ALTER TABLE home_content 
ADD COLUMN IF NOT EXISTS image_alt VARCHAR(255),
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_images_sort_order ON gallery_images(sort_order);
CREATE INDEX IF NOT EXISTS idx_image_variants_image_id ON image_variants(image_id);
CREATE INDEX IF NOT EXISTS idx_image_variants_type ON image_variants(variant_type);
CREATE INDEX IF NOT EXISTS idx_home_content_section ON home_content(section);
CREATE INDEX IF NOT EXISTS idx_home_content_sort_order ON home_content(sort_order);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON gallery_images TO anon;
GRANT SELECT ON image_variants TO anon;
GRANT SELECT ON home_content TO anon;

GRANT ALL PRIVILEGES ON gallery_images TO authenticated;
GRANT ALL PRIVILEGES ON image_variants TO authenticated;
GRANT ALL PRIVILEGES ON home_content TO authenticated;
GRANT ALL PRIVILEGES ON admins TO authenticated;