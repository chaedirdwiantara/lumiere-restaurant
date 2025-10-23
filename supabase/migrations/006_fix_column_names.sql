-- Fix column name mismatches in gallery_images and image_variants tables

-- Add display_order column to gallery_images (rename sort_order)
ALTER TABLE gallery_images 
RENAME COLUMN sort_order TO display_order;

-- Add original_url column to gallery_images (rename public_url)
ALTER TABLE gallery_images 
RENAME COLUMN public_url TO original_url;

-- Fix image_variants table column name
ALTER TABLE image_variants 
RENAME COLUMN image_id TO gallery_image_id;

-- Update the foreign key constraint
ALTER TABLE image_variants 
DROP CONSTRAINT IF EXISTS image_variants_gallery_image_id_fkey;

ALTER TABLE image_variants 
ADD CONSTRAINT image_variants_gallery_image_id_fkey 
FOREIGN KEY (gallery_image_id) REFERENCES gallery_images(id) ON DELETE CASCADE;

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON gallery_images TO anon;
GRANT SELECT ON image_variants TO anon;
GRANT ALL PRIVILEGES ON gallery_images TO authenticated;
GRANT ALL PRIVILEGES ON image_variants TO authenticated;