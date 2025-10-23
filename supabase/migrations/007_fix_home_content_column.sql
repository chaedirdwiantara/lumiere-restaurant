-- Fix column name mismatch in home_content table

-- Rename section column to section_key
ALTER TABLE home_content 
RENAME COLUMN section TO section_key;

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON home_content TO anon;
GRANT ALL PRIVILEGES ON home_content TO authenticated;