-- Fix missing columns in gallery_images and home_content tables
-- This migration addresses the database schema issues

-- Check if display_order column exists in gallery_images, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery_images' 
        AND column_name = 'display_order'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE gallery_images ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Check if section_key column exists in home_content, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'home_content' 
        AND column_name = 'section_key'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE home_content ADD COLUMN section_key VARCHAR(100) NOT NULL DEFAULT 'default';
        -- Add unique constraint
        ALTER TABLE home_content ADD CONSTRAINT home_content_section_key_unique UNIQUE (section_key);
    END IF;
END $$;

-- Update existing records with proper section_key values if they exist
UPDATE home_content SET section_key = 'hero' WHERE section_key = 'default' AND title LIKE '%Hero%' OR title LIKE '%Welcome%';
UPDATE home_content SET section_key = 'about' WHERE section_key = 'default' AND title LIKE '%About%';
UPDATE home_content SET section_key = 'features' WHERE section_key = 'default' AND title LIKE '%Feature%';
UPDATE home_content SET section_key = 'testimonials' WHERE section_key = 'default' AND title LIKE '%Testimonial%';
UPDATE home_content SET section_key = 'cta' WHERE section_key = 'default' AND title LIKE '%CTA%' OR title LIKE '%Call%';

-- Set display_order for existing gallery images
-- First, set featured images to order 1
UPDATE gallery_images SET display_order = 1 WHERE is_featured = true AND (display_order = 0 OR display_order IS NULL);

-- Then, set non-featured images with incremental order starting from 2
WITH ordered_images AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) + 1 as new_order
    FROM gallery_images 
    WHERE (is_featured = false OR is_featured IS NULL) AND (display_order = 0 OR display_order IS NULL)
)
UPDATE gallery_images 
SET display_order = ordered_images.new_order
FROM ordered_images 
WHERE gallery_images.id = ordered_images.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_display_order ON gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_home_content_section_key ON home_content(section_key);