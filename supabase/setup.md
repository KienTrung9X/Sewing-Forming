# Hướng dẫn Setup Supabase Cloud Database

## Bước 1: Tạo Project trên Supabase (Web)
1. Truy cập https://supabase.com và đăng ký/đăng nhập
2. Click "New Project"
3. Nhập tên project, database password, chọn region (Singapore gần VN)
4. Đợi project khởi tạo (~2 phút)

## Bước 2: Chạy SQL Schema trên Web
1. Vào project vừa tạo
2. Click "SQL Editor" ở menu bên trái
3. Click "New Query"
4. Copy toàn bộ nội dung file `schema.sql` và paste vào
5. Click "Run" để tạo bảng reports

## Bước 3: Setup Storage cho Images (Web)
1. Click "Storage" ở menu bên trái
2. Click "Create a new bucket"
3. Tên bucket: `report-images`
4. Chọn "Public bucket"
5. Click "Create bucket"

## Bước 4: Lấy API Keys
1. Click "Settings" > "API"
2. Copy "Project URL" và "anon public" key
3. Thêm vào file `.env.local`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## Bước 5: Cài đặt Supabase Client
```bash
npm install @supabase/supabase-js
```
