import { createClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '@/types';

// Supabase configuration
const supabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Validate required environment variables
if (!supabaseConfig.url || !supabaseConfig.anonKey || !supabaseConfig.serviceRoleKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client with service role key for admin operations
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create Supabase client with anon key for public operations
export const supabasePublic = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Export supabase as supabaseService for consistency
export const supabaseService = supabase;

// Export storage client
export const supabaseStorage = supabase.storage;

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  GALLERY: 'gallery-images',
  HOME: 'home-content',
  TEMP: 'temp-uploads',
} as const;

// Initialize storage buckets
export const initializeStorageBuckets = async (): Promise<void> => {
  try {
    const buckets = Object.values(STORAGE_BUCKETS);
    
    for (const bucketName of buckets) {
      const { data: existingBucket } = await supabase.storage.getBucket(bucketName);
      
      if (!existingBucket) {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) {
          console.error(`Failed to create bucket ${bucketName}:`, error.message);
        } else {
          console.log(`✅ Created storage bucket: ${bucketName}`);
        }
      } else {
        console.log(`✅ Storage bucket exists: ${bucketName}`);
      }
    }
  } catch (error) {
    console.error('Storage bucket initialization error:', error);
  }
};

export default supabase;