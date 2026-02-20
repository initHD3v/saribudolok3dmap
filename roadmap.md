# Roadmap Strategis: Saribudolok 3D Geo Experience Platform

## 🏗️ Fase 1: Inisialisasi Infrastruktur & Arsitektur Database
*Fokus: Membangun pondasi yang skalabel dan mendukung data spasial.*
- **1.1 Setup Monorepo/Workspace:** Inisialisasi NestJS (Backend) dan Next.js (Frontend) dengan TypeScript.
- **1.2 Containerization:** Konfigurasi `docker-compose.yml` untuk PostgreSQL + PostGIS, pgvector (AI), Redis (Caching), dan LocalStack (S3 mock).
- **1.3 Skema Database Spasial:**
    - Setup Prisma ORM dengan *manual migrations* untuk mendukung tipe data `GEOMETRY`.
    - Implementasi tabel `regions`, `revisions`, `region_details`, dan `ai_knowledge_base`.
    - Pembuatan **Spatial Index (GIST)** pada kolom geometri untuk optimasi query.
- **1.4 Boilerplate API:** Setup Global Exception Filter, Logger, dan Standard Response di NestJS.

## 🗄️ Fase 2: Data Ingestion, Enrichment & Normalization
*Fokus: Memastikan data "siap saji" untuk peta dan AI.*
- **2.1 GeoJSON Seeder:** Script untuk migrasi data `saribu_dolok_12.08.25.1012.geojson` ke database.
- **2.2 Data Enrichment:** Input data statistik (populasi, ekonomi, pariwisata) ke tabel `region_details`.
- **2.3 Geometry Normalization:** Implementasi `ST_Simplify` dan `ST_MakeValid` di level backend untuk memastikan geometri bersih dan ringan.
- **2.4 Metadata Extraction:** Ekstraksi koordinat pusat (centroid) dan bounding box (BBOX) untuk navigasi otomatis.

## 🌐 Fase 3: 3D Visualization & UI Implementation
*Fokus: Menciptakan pengalaman visual 3D dan UI Glassmorphism imersif.*
- **3.1 Mapbox Integration:** Setup Mapbox GL JS dengan custom dark theme.
- **3.2 Terrain & Lighting:** Mengaktifkan **Mapbox Terrain RGB** (DEM) dan sistem pencahayaan.
- **3.3 UI Component System (Glassmorphism):**
    - Implementasi styling **backdrop-blur** dan border transparan sesuai desain `ui.png`.
    - Setup **Framer Motion** untuk animasi panel transisi (Explore, Edit, Chat).
- **3.4 3D Extrusion Engine:** Implementasi layer `fill-extrusion` berbasis data atribut.
- **3.5 Cinematic Camera:** Membuat fungsi *camera flyover* dan transisi halus antar wilayah.

## ✍️ Fase 4: Advanced Boundary Editor & Versioning System
*Fokus: Fitur manipulasi peta dengan integritas data tinggi.*
- **4.1 Editor Tools:** Integrasi `Mapbox-Draw` dengan validasi `Turf.js` di sisi client.
- **4.2 Real-time Metrics UI:** Menampilkan perubahan luas wilayah secara instan (Contoh: `+0.12 km²`) sesuai desain.
- **4.3 Revision Workflow:**
    - Sistem penyimpanan *draft* revisi (status: pending, approved, rejected).
    - Visualisasi komparasi: Overlay poligon lama vs baru dengan perbedaan warna.
- **4.4 Conflict Handling & Backend Validation:** Implementasi **Optimistic Locking** dan validasi PostGIS.

## 🤖 Fase 5: AI Spatial Intelligence (RAG + Function Calling)
*Fokus: Memberikan "otak" pada peta untuk menjawab pertanyaan kompleks.*
- **5.1 Vector Ingestion:** Konversi data `region_details` dan regulasi menjadi embedding di `pgvector`.
- **5.2 Spatial Function Calling:** Menghubungkan LLM dengan API PostGIS.
- **5.3 AI Action UI:** Implementasi tombol aksi di dalam chat (Tampilkan Peta, Lihat Galeri) sesuai desain.

## 📊 Fase 6: Dashboard Analytics & Admin Control
*Fokus: Manajemen data dan insight strategis.*
- **6.1 Insight Dashboard (Recharts):** Visualisasi grafik Penduduk, Ekonomi, dan Pariwisata dengan custom gradient styling.
- **6.2 Admin Approval Panel:** Interface untuk Admin meninjau revisi batas wilayah.
- **6.3 Data Export:** Fitur download data dalam format GeoJSON, KML, dan CSV.

## 🚀 Fase 7: Security, Performance & Deployment
*Fokus: Menjamin keamanan dan kecepatan akses.*
- **7.1 Authentication & RBAC:** Implementasi JWT Auth dengan peran Guest, Registered, Editor, dan Admin.
- **7.2 Optimization:**
    - Implementasi **Vector Tiles (MVT)** untuk data skala besar.
    - Caching API dengan Redis.
- **7.3 Deployment:** Setup CI/CD, Nginx Reverse Proxy, dan HTTPS/SSL di Cloud VPS.
