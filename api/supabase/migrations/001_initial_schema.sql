-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    alt_text VARCHAR(255),
    category VARCHAR(100),
    tags TEXT[],
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    public_url VARCHAR(500) NOT NULL,
    width INTEGER,
    height INTEGER,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create image_variants table for different sizes/formats
CREATE TABLE IF NOT EXISTS image_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL, -- 'thumbnail', 'medium', 'large', 'webp', etc.
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    public_url VARCHAR(500) NOT NULL,
    quality INTEGER DEFAULT 80,
    format VARCHAR(20) NOT NULL, -- 'jpeg', 'webp', 'png'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create home_content table for managing home page content
CREATE TABLE IF NOT EXISTS home_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(100) NOT NULL UNIQUE, -- 'hero', 'about', 'features', 'testimonials'
    title VARCHAR(255),
    subtitle VARCHAR(255),
    content TEXT,
    image_url VARCHAR(500),
    image_alt VARCHAR(255),
    button_text VARCHAR(100),
    button_url VARCHAR(500),
    metadata JSONB, -- For flexible additional data
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    updated_by UUID REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_images_is_featured ON gallery_images(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_images_is_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_sort_order ON gallery_images(sort_order);

CREATE INDEX IF NOT EXISTS idx_image_variants_image_id ON image_variants(image_id);
CREATE INDEX IF NOT EXISTS idx_image_variants_type ON image_variants(variant_type);

CREATE INDEX IF NOT EXISTS idx_home_content_section ON home_content(section);
CREATE INDEX IF NOT EXISTS idx_home_content_is_active ON home_content(is_active);
CREATE INDEX IF NOT EXISTS idx_home_content_sort_order ON home_content(sort_order);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON home_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;

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
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage image variants" ON image_variants
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for home_content table
CREATE POLICY "Anyone can view active home content" ON home_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage home content" ON home_content
    FOR ALL USING (auth.role() = 'authenticated');