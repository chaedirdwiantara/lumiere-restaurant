# Panduan Deployment ke Vercel

## Masalah Upload Image yang Telah Diperbaiki

### 1. Konfigurasi Vercel.json
- Menambahkan konfigurasi `functions` untuk mengatur timeout API routes
- Menambahkan rewrite rules untuk API routes
- Mengatur `maxDuration` untuk menangani upload file yang membutuhkan waktu lebih lama

### 2. API Routes Configuration
- Menambahkan `export const config = { api: { bodyParser: false } }` pada semua API routes yang menangani upload
- Menonaktifkan body parser default Next.js untuk file upload
- Menambahkan error handling yang lebih baik untuk environment serverless

### 3. CORS Configuration
- Memperbaiki CORS middleware untuk menangani multiple origins
- Menambahkan support untuk Vercel deployment URL
- Mengatur proper origin validation

### 4. File Validation Enhancement
- Menambahkan validasi buffer untuk serverless environment
- Menambahkan logging yang lebih detail untuk debugging
- Menangani edge cases pada serverless functions

## Environment Variables yang Diperlukan

Pastikan environment variables berikut sudah dikonfigurasi di Vercel:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars
CORS_ORIGINS=https://your-vercel-app.vercel.app
NODE_ENV=production
```

## Langkah Deployment

1. **Push ke Repository**
   ```bash
   git add .
   git commit -m "Fix image upload for Vercel deployment"
   git push origin main
   ```

2. **Deploy ke Vercel**
   - Vercel akan otomatis deploy dari repository
   - Atau gunakan Vercel CLI: `vercel --prod`

3. **Konfigurasi Environment Variables**
   - Masuk ke Vercel Dashboard
   - Pilih project Anda
   - Masuk ke Settings > Environment Variables
   - Tambahkan semua environment variables yang diperlukan

4. **Update CORS Origins**
   - Setelah deployment, dapatkan URL Vercel app Anda
   - Update `CORS_ORIGINS` environment variable dengan URL tersebut
   - Redeploy jika diperlukan

## Testing Upload Functionality

Setelah deployment:

1. Akses admin panel di `https://your-vercel-app.vercel.app/admin`
2. Login dengan credentials admin
3. Coba upload image di Gallery Management
4. Periksa browser console untuk error jika ada masalah
5. Periksa Vercel function logs untuk debugging server-side

## Troubleshooting

### Jika Upload Masih Gagal:

1. **Periksa Function Logs**
   - Masuk ke Vercel Dashboard > Functions
   - Periksa logs untuk error messages

2. **Periksa Environment Variables**
   - Pastikan semua environment variables sudah benar
   - Khususnya SUPABASE credentials

3. **Periksa CORS**
   - Pastikan URL Vercel app sudah ditambahkan ke CORS_ORIGINS
   - Periksa browser network tab untuk CORS errors

4. **File Size Limits**
   - Vercel memiliki limit 4.5MB untuk serverless functions
   - Pastikan file yang diupload tidak terlalu besar

### Common Issues:

- **"No file buffer provided"**: Biasanya terjadi karena body parser tidak dinonaktifkan
- **CORS errors**: URL tidak ditambahkan ke allowed origins
- **Timeout errors**: File terlalu besar atau processing terlalu lama
- **Authentication errors**: JWT secrets tidak dikonfigurasi dengan benar

## Optimisasi Performa

1. **Image Compression**: Sharp sudah dikonfigurasi untuk mengoptimalkan gambar
2. **Multiple Variants**: Sistem membuat thumbnail, medium, dan large variants
3. **Caching**: Supabase storage menyediakan CDN caching
4. **Error Handling**: Comprehensive error handling untuk debugging

Dengan perbaikan ini, upload image seharusnya berfungsi dengan baik di Vercel deployment.