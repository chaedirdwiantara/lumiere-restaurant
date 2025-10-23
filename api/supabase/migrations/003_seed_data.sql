-- Insert default admin user
INSERT INTO admins (email, password_hash, name, role, is_active) 
VALUES (
    'admin@cycentsinema.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0kPjiYlqGO', -- SecurePassword123!
    'System Administrator',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample home content
INSERT INTO home_content (section, title, subtitle, description, image_url, button_text, button_url, is_active, sort_order) VALUES
(
    'hero',
    'Welcome to Cycent Cinema',
    'Experience Cinema Like Never Before',
    'Immerse yourself in the ultimate movie experience with state-of-the-art technology, premium comfort, and exceptional service.',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20cinema%20interior%20with%20premium%20seating%20and%20large%20screen&image_size=landscape_16_9',
    'Book Now',
    '/booking',
    true,
    1
),
(
    'about',
    'About Cycent Cinema',
    'Premium Entertainment Destination',
    'Since our establishment, we have been committed to providing the finest cinematic experience. Our state-of-the-art facilities, comfortable seating, and cutting-edge sound systems ensure every visit is memorable.',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20cinema%20lobby%20with%20modern%20design%20and%20warm%20lighting&image_size=landscape_4_3',
    'Learn More',
    '/about',
    true,
    2
),
(
    'features',
    'Premium Features',
    'What Makes Us Special',
    'Experience the difference with our premium amenities including IMAX screens, Dolby Atmos sound, luxury reclining seats, and gourmet concessions.',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cinema%20auditorium%20with%20luxury%20reclining%20seats%20and%20large%20screen&image_size=landscape_4_3',
    'View Features',
    '/features',
    true,
    3
) ON CONFLICT (section) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    button_text = EXCLUDED.button_text,
    button_url = EXCLUDED.button_url,
    updated_at = NOW();

-- Insert sample gallery images
INSERT INTO gallery_images (
    title, 
    description, 
    alt_text, 
    category, 
    tags, 
    original_filename, 
    file_size, 
    mime_type, 
    storage_path, 
    public_url, 
    width, 
    height, 
    is_featured, 
    is_active, 
    sort_order
) VALUES
(
    'Premium Theater Experience',
    'Our state-of-the-art theater with luxury seating and premium sound system',
    'Modern cinema theater with red luxury seats and large screen',
    'theater',
    ARRAY['theater', 'luxury', 'seating', 'premium'],
    'theater-premium.jpg',
    2048000,
    'image/jpeg',
    'gallery/theater-premium.jpg',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20cinema%20theater%20with%20red%20velvet%20seats%20and%20large%20screen&image_size=landscape_16_9',
    1920,
    1080,
    true,
    true,
    1
),
(
    'IMAX Experience',
    'Experience movies like never before with our IMAX technology',
    'IMAX cinema screen with curved design and premium seating',
    'technology',
    ARRAY['imax', 'technology', 'premium', 'experience'],
    'imax-theater.jpg',
    1856000,
    'image/jpeg',
    'gallery/imax-theater.jpg',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=IMAX%20cinema%20with%20curved%20screen%20and%20stadium%20seating&image_size=landscape_16_9',
    1920,
    1080,
    true,
    true,
    2
),
(
    'Elegant Lobby',
    'Welcome to our beautifully designed lobby with modern amenities',
    'Modern cinema lobby with elegant lighting and comfortable seating areas',
    'lobby',
    ARRAY['lobby', 'modern', 'elegant', 'design'],
    'elegant-lobby.jpg',
    1724000,
    'image/jpeg',
    'gallery/elegant-lobby.jpg',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cinema%20lobby%20with%20elegant%20design%20marble%20floors%20and%20comfortable%20seating&image_size=landscape_4_3',
    1600,
    1200,
    false,
    true,
    3
),
(
    'Gourmet Concessions',
    'Enjoy premium snacks and beverages at our gourmet concession stand',
    'Modern concession stand with gourmet popcorn and premium beverages',
    'concessions',
    ARRAY['concessions', 'food', 'gourmet', 'snacks'],
    'gourmet-concessions.jpg',
    1512000,
    'image/jpeg',
    'gallery/gourmet-concessions.jpg',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cinema%20concession%20stand%20with%20gourmet%20popcorn%20and%20premium%20beverages&image_size=landscape_4_3',
    1600,
    1200,
    false,
    true,
    4
),
(
    'VIP Lounge',
    'Relax in our exclusive VIP lounge before your movie',
    'Luxurious VIP lounge with comfortable seating and ambient lighting',
    'vip',
    ARRAY['vip', 'lounge', 'luxury', 'exclusive'],
    'vip-lounge.jpg',
    1892000,
    'image/jpeg',
    'gallery/vip-lounge.jpg',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20VIP%20cinema%20lounge%20with%20comfortable%20leather%20seating%20and%20ambient%20lighting&image_size=landscape_4_3',
    1600,
    1200,
    false,
    true,
    5
);