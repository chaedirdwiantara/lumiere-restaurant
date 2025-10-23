-- Delete existing admin and recreate with correct password
DELETE FROM admins WHERE email = 'admin@cycentsinema.com';

-- Insert admin with correct password hash for 'SecurePassword123'
INSERT INTO admins (email, password_hash, name, role, is_active) 
VALUES (
    'admin@cycentsinema.com',
    '$2b$12$z6tnNWBTy66oH7HxgKRaeuqwAxCtkfjaW1D6eyAQKALZ0rUG9YQuG',
    'System Administrator',
    'admin',
    true
);