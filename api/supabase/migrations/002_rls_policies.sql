-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions to anon role for public access
GRANT SELECT ON gallery_images TO anon;
GRANT SELECT ON image_variants TO anon;
GRANT SELECT ON home_content TO anon;

-- Grant full permissions to authenticated role (admins)
GRANT ALL PRIVILEGES ON admins TO authenticated;
GRANT ALL PRIVILEGES ON gallery_images TO authenticated;
GRANT ALL PRIVILEGES ON image_variants TO authenticated;
GRANT ALL PRIVILEGES ON home_content TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RLS Policies for admins table
CREATE POLICY "Admins can view their own profile" ON admins
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can update their own profile" ON admins
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for gallery_images table
CREATE POLICY "Anyone can view active gallery images" ON gallery_images
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage gallery images" ON gallery_images
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for image_variants table
CREATE POLICY "Anyone can view image variants" ON image_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM gallery_images gi 
            WHERE gi.id = image_variants.gallery_image_id 
            AND gi.is_active = true
        )
    );

CREATE POLICY "Authenticated users can manage image variants" ON image_variants
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for home_content table
CREATE POLICY "Anyone can view active home content" ON home_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage home content" ON home_content
    FOR ALL USING (auth.role() = 'authenticated');