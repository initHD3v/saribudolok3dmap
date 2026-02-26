# 🏔️ Saribudolok: 3D Geo Experience Platform

![Saribudolok Banner](assets/banner.png)

**Saribudolok 3D Geo Experience** adalah platform eksplorasi geografis interaktif yang dirancang khusus untuk memvisualisasikan data, budaya, dan potensi Desa Saribudolok dalam format 3D yang modern dan imersif.

---

## ✨ Fitur Utama

- **🌍 Peta Geo-Spasial 3D**: Visualisasi berbasis MapLibre GL dengan medan (*terrain*) nyata dan efek pendar (*neon glow*) pada batas wilayah.
- **🗺️ Navigasi Interaktif**: Jelajahi wilayah melalui tab khusus:
  - **Ringkasan**: Data statistik cepat (Luas, Elevasi, Populasi).
  - **Geografi**: Informasi mendalam tentang topografi dan iklim.
  - **Wisata**: Destinasi unggulan (Paropo, Aek Nauli, Simalem) dengan galeri foto.
  - **Budaya**: Mengenal tradisi, kuliner, dan ekonomi lokal Simalungun.
- **🛸 Interface Futuristik**: Desain *Glassmorphism* dengan dukungan Dark/Light mode dan animasi *Welcome Overlay* yang menawan.
- **🔍 Fitur Pencarian Cerdas**: Kemudahan mencari lokasi atau topik spesifik dalam wilayah Saribudolok.
- **🤖 Kapabilitas AI (Upcoming)**: Integrasi kecerdasan buatan untuk analisis spasial dan tanya jawab wilayah.

---

## 📸 Preview Interface

### 🎯 Landing & Overview
![Welcome Overlay](assets/welcome.png)
*Layar pembuka animasi menyambut setiap petualangan baru di Saribudolok.*

### 🏙️ 3D Map Visualization
![3D Map Hero](assets/hero_screenshot.png)
*Visualisasi batas wilayah 3D dengan label dinamis dan efek glassmorphism.*

### 🏔️ Informasi Komprehensif
![Features & Tabs](assets/features.png)
*Panel sidebar interaktif yang menyajikan data lengkap dalam satu genggaman.*

---

## 🛠️ Teknologi yang Digunakan

| Sisi | Teknologi |
|------|-----------|
| **Frontend** | [Next.js](https://nextjs.org/) (Turbopack), React 19, Tailwind CSS 4 |
| **Peta** | MapLibre GL JS, MapTiler DEM, GeoJSON |
| **Animasi** | Framer Motion, Lucide Icons |
| **Backend** | [NestJS](https://nestjs.com/), Prisma, PostgreSQL (PostGIS) |
| **Desain** | Glassmorphism, Modern UI/UX Design |

---

## 🚀 Cara Menjalankan (Local)

1. **Clone Repository**:
   ```bash
   git clone https://github.com/initialh/saribudolok.git
   cd saribudolok
   ```

2. **Setup Frontend**:
   ```bash
   cd apps/web
   npm install
   ```

3. **Konfigurasi Environment**:
   Buat file `.env.local` di folder `apps/web` dan masukkan API Key:
   ```env
   NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
   ```

4. **Jalankan Aplikasi**:
   ```bash
   npm run dev
   ```
   Akses di [http://localhost:3000](http://localhost:3000)

---

## 📝 Konten & Data

Project ini menggunakan data statis yang kaya akan informasi tentang Saribudolok sebagai tahap awal, dengan rencana integrasi berkelanjutan ke database backend untuk data dinamis.

---

## ❤️ Kontributor

Dibuat dengan dedikasi untuk Desa Saribudolok. 

**© 2026 Saribudolok Geo Platform**
