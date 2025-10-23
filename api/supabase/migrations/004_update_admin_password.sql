-- Update admin password with correct hash
UPDATE admins 
SET password_hash = '$2b$12$z6tnNWBTy66oH7HxgKRaeuqwAxCtkfjaW1D6eyAQKALZ0rUG9YQuG'
WHERE email = 'admin@cycentsinema.com';