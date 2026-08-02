# Product Requirements Document (PRD)
# TravelMate — AI Travel Assistant Chatbot

**Versi:** 1.0
**Status:** Draft untuk implementasi
**Tujuan dokumen:** Menjadi single source of truth bagi developer maupun AI coding agent. Semua keputusan teknis, skema data, dan kontrak API didefinisikan di sini secara eksplisit untuk menghindari asumsi/halusinasi saat implementasi.

---

## 1. Ringkasan Produk

TravelMate adalah chatbot berbasis AI (Gemini API) yang membantu pengguna merencanakan perjalanan secara percakapan. Pengguna cukup mengobrol dalam bahasa natural, dan sistem menghasilkan itinerary terstruktur, estimasi budget, info cuaca, dan visualisasi peta — tanpa perlu membuka banyak sumber terpisah.

## 2. Masalah yang Diselesaikan

Pengguna saat ini merencanakan perjalanan dengan cara manual: scroll media sosial, baca blog travel, cek Google Maps satu per satu, tanya di forum/grup, dan hitung budget manual di kalkulator. Proses ini memakan waktu 3-4 jam, informasinya sering tidak akurat/update, dan tidak mempertimbangkan preferensi personal secara langsung.

## 3. Target Pengguna

- Mahasiswa/individu dengan budget terbatas yang ingin liburan singkat (2-5 hari)
- Fokus awal: destinasi domestik Indonesia
- Bahasa utama: Bahasa Indonesia (dengan dukungan istilah Inggris dasar)

## 4. Goals & Non-Goals

### Goals (harus ada di MVP)
1. Chatbot dapat memahami permintaan perjalanan dalam bahasa natural dan menggali informasi yang kurang (destinasi, durasi, budget, minat)
2. Chatbot dapat menghasilkan itinerary terstruktur (JSON) yang dirender sebagai UI kartu/timeline
3. Sistem dapat menyimpan dan menampilkan kembali riwayat trip yang pernah dibuat
4. Sistem dapat mempersonalisasi respons berdasarkan preferensi user yang tersimpan
5. Sistem menampilkan info cuaca dan peta rute untuk itinerary yang dihasilkan
6. User dapat login/register dan datanya terpisah secara aman antar user

### Non-Goals (secara eksplisit TIDAK dikerjakan di MVP)
- Booking/transaksi nyata (tiket, hotel, dsb) — hanya rekomendasi
- Payment gateway
- Real-time GPS tracking selama perjalanan berlangsung
- Multi-bahasa penuh (selain ID/EN dasar)
- Native mobile app (web-only, responsive)
- Fitur kolaborasi multi-user dalam satu trip (real-time sharing)

## 5. Tech Stack (FIXED — jangan diganti tanpa alasan eksplisit)

| Layer | Teknologi | Catatan |
|---|---|---|
| Frontend | Next.js 14+ (App Router) + Tailwind CSS | React Server Components boleh dipakai untuk halaman statis; chat UI harus Client Component |
| Backend | Next.js API Routes (Route Handlers) | Tidak perlu server Express terpisah — semua logic backend ada di `/app/api/*` |
| Database | Supabase (PostgreSQL) | Termasuk Supabase Auth |
| AI Engine | Google Gemini API — model `gemini-2.5-flash` | Jangan pakai `gemini-2.5-pro` (limit free tier sangat kecil: 50 request/hari) |
| Peta | Leaflet.js + react-leaflet + OpenStreetMap tiles | Tidak pakai Google Maps (butuh billing) |
| Cuaca | Open-Meteo API | Tanpa API key |
| Currency (opsional, jika ada trip luar negeri) | Frankfurter API | Tanpa API key |
| Hosting | Vercel | Frontend + API routes dalam satu deployment |
| State management frontend | React `useState`/`useContext` bawaan | Tidak perlu Redux/Zustand untuk scope MVP ini |

**Aturan untuk AI agent:** Jangan mengganti pustaka di atas dengan alternatif lain (misalnya jangan ganti Leaflet dengan Mapbox, atau Supabase dengan Firebase) kecuali diminta eksplisit oleh user.

## 6. Environment Variables yang Dibutuhkan

```
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # hanya dipakai di server-side route handler, JANGAN exposed ke client
```

## 7. Skema Database (Supabase / PostgreSQL)

Catatan: `auth.users` disediakan otomatis oleh Supabase Auth, tidak perlu dibuat manual.

```sql
-- =========================================
-- 1. user_preferences
-- =========================================
create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  traveler_type text check (traveler_type in ('backpacker','family','honeymoon','kuliner','umum')) default 'umum',
  budget_range text check (budget_range in ('hemat','menengah','mewah')) default 'menengah',
  food_pref text,               -- contoh: "pedas", "tidak pedas", "vegetarian"
  language_style text check (language_style in ('formal','santai')) default 'santai',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- =========================================
-- 2. chat_messages
-- =========================================
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  trip_id uuid references trips(id) on delete set null,  -- nullable, diisi jika pesan terkait trip tertentu
  created_at timestamptz default now()
);

-- =========================================
-- 3. trips
-- =========================================
create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,              -- contoh: "Liburan Jogja 3 Hari"
  destination text not null,
  total_budget numeric,
  start_date date,
  end_date date,
  status text check (status in ('draft','final')) default 'draft',
  created_at timestamptz default now()
);

-- =========================================
-- 4. trip_days
-- =========================================
create table trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day_number int not null,
  date date,
  unique(trip_id, day_number)
);

-- =========================================
-- 5. trip_activities
-- =========================================
create table trip_activities (
  id uuid primary key default gen_random_uuid(),
  trip_day_id uuid not null references trip_days(id) on delete cascade,
  sequence int not null,            -- urutan aktivitas dalam hari itu
  time text,                        -- contoh: "09:00"
  location_name text not null,
  activity_description text,
  estimated_cost numeric default 0,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now()
);
```

### Row Level Security (RLS) — WAJIB diaktifkan

```sql
alter table user_preferences enable row level security;
alter table chat_messages enable row level security;
alter table trips enable row level security;
alter table trip_days enable row level security;
alter table trip_activities enable row level security;

-- Policy contoh untuk trips (pola yang sama diterapkan ke semua tabel yang punya user_id)
create policy "Users can CRUD their own trips"
  on trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own preferences"
  on user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own chat messages"
  on chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- trip_days dan trip_activities tidak punya user_id langsung,
-- policy dibuat via join ke trips
create policy "Users can access trip_days of their own trips"
  on trip_days for all
  using (exists (select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid()))
  with check (exists (select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid()));

create policy "Users can access trip_activities of their own trips"
  on trip_activities for all
  using (exists (
    select 1 from trip_days
    join trips on trips.id = trip_days.trip_id
    where trip_days.id = trip_activities.trip_day_id and trips.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from trip_days
    join trips on trips.id = trip_days.trip_id
    where trip_days.id = trip_activities.trip_day_id and trips.user_id = auth.uid()
  ));
```

## 8. Struktur Folder Project (FIXED)

```
travelmate/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── chat/page.tsx              # halaman utama chatbot
│   │   ├── trips/page.tsx             # daftar riwayat trip
│   │   ├── trips/[id]/page.tsx        # detail satu trip (itinerary + peta)
│   │   └── settings/page.tsx          # preferensi user
│   ├── api/
│   │   ├── chat/route.ts              # POST — kirim pesan, terima respons AI
│   │   ├── trips/route.ts             # GET (list), POST (create)
│   │   ├── trips/[id]/route.ts        # GET, PATCH, DELETE
│   │   ├── weather/route.ts           # GET — proxy ke Open-Meteo
│   │   └── preferences/route.ts       # GET, PATCH
│   └── layout.tsx
├── components/
│   ├── chat/ChatWindow.tsx
│   ├── chat/ChatBubble.tsx
│   ├── chat/PersonaSelector.tsx
│   ├── itinerary/ItineraryCard.tsx
│   ├── itinerary/DayTimeline.tsx
│   └── map/TripMap.tsx
├── lib/
│   ├── supabase/client.ts             # Supabase client untuk browser
│   ├── supabase/server.ts             # Supabase client untuk server (route handlers)
│   ├── gemini/client.ts               # Wrapper pemanggilan Gemini API
│   ├── gemini/prompts.ts              # Template system_instruction per persona
│   ├── gemini/schema.ts               # response_schema untuk structured output
│   └── weather.ts                     # Fungsi fetch Open-Meteo
├── types/
│   └── index.ts                       # Semua TypeScript interface (lihat Bagian 10)
├── .env.local
└── package.json
```

## 9. Kontrak API Internal (Route Handlers)

### 9.1 `POST /api/chat`

**Request body:**
```json
{
  "message": "string, pesan dari user",
  "trip_id": "uuid | null, jika melanjutkan trip yang sudah ada"
}
```

**Behavior:**
1. Ambil `user_id` dari sesi Supabase Auth (server-side, dari cookie)
2. Ambil `user_preferences` user tersebut dari Supabase
3. Ambil beberapa pesan terakhir dari `chat_messages` untuk konteks (limit 10 terakhir)
4. Bangun `system_instruction` dinamis (lihat Bagian 11) berdasarkan `traveler_type` dan `language_style`
5. Panggil Gemini API dengan riwayat percakapan + pesan baru
6. Jika Gemini mendeteksi user sudah memberi info cukup (destinasi, durasi, budget) → panggil Gemini lagi dengan `response_schema` itinerary untuk generate itinerary terstruktur
7. Simpan pesan user dan respons assistant ke `chat_messages`
8. Jika ada itinerary yang digenerate → simpan ke `trips`, `trip_days`, `trip_activities`

**Response body:**
```json
{
  "reply": "string, teks balasan bot",
  "itinerary": {
    "trip_id": "uuid",
    "destination": "string",
    "days": [
      {
        "day_number": 1,
        "activities": [
          {
            "time": "09:00",
            "location_name": "string",
            "activity_description": "string",
            "estimated_cost": 50000,
            "latitude": -7.7956,
            "longitude": 110.3695
          }
        ]
      }
    ],
    "total_budget_estimate": 1500000
  }
}
```
Field `itinerary` bernilai `null` jika respons bot masih berupa percakapan biasa (belum saatnya generate itinerary).

### 9.2 `GET /api/trips`
Mengembalikan daftar trip milik user yang sedang login, urut dari terbaru.

**Response:**
```json
{
  "trips": [
    { "id": "uuid", "title": "string", "destination": "string", "start_date": "date", "end_date": "date", "total_budget": 1500000, "status": "draft" }
  ]
}
```

### 9.3 `GET /api/trips/[id]`
Mengembalikan detail lengkap satu trip beserta seluruh `trip_days` dan `trip_activities` (nested).

### 9.4 `PATCH /api/trips/[id]`
Update field trip (misal: ubah status dari `draft` ke `final`, atau edit budget).

### 9.5 `DELETE /api/trips/[id]`
Hapus trip (cascade ke trip_days dan trip_activities via FK).

### 9.6 `GET /api/weather?lat={lat}&lon={lon}&date={date}`
Proxy ke Open-Meteo, mengembalikan prakiraan cuaca untuk lokasi & tanggal tertentu.

### 9.7 `GET /api/preferences`
Ambil preferensi user yang login.

### 9.8 `PATCH /api/preferences`
Update preferensi user (traveler_type, budget_range, food_pref, language_style).

## 10. TypeScript Interfaces (types/index.ts) — WAJIB dipakai konsisten

```typescript
export type TravelerType = 'backpacker' | 'family' | 'honeymoon' | 'kuliner' | 'umum';
export type BudgetRange = 'hemat' | 'menengah' | 'mewah';
export type LanguageStyle = 'formal' | 'santai';
export type TripStatus = 'draft' | 'final';
export type ChatRole = 'user' | 'assistant';

export interface UserPreferences {
  id: string;
  user_id: string;
  traveler_type: TravelerType;
  budget_range: BudgetRange;
  food_pref: string | null;
  language_style: LanguageStyle;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  trip_id: string | null;
  created_at: string;
}

export interface TripActivity {
  id: string;
  trip_day_id: string;
  sequence: number;
  time: string | null;
  location_name: string;
  activity_description: string | null;
  estimated_cost: number;
  latitude: number | null;
  longitude: number | null;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  activities: TripActivity[];
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  total_budget: number | null;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  days?: TripDay[];
}
```

## 11. Spesifikasi Prompt Engineering (Gemini API)

### 11.1 Parameter Gemini (FIXED)

```typescript
{
  model: "gemini-2.5-flash",
  temperature: 0.8,
  maxOutputTokens: 2048
}
```

### 11.2 Template `system_instruction` Dinamis

```
Kamu adalah TravelMate, asisten perencana perjalanan yang membantu pengguna di Indonesia.

Gaya bahasa: {{ language_style === 'formal' ? 'Gunakan bahasa Indonesia formal dan sopan.' : 'Gunakan bahasa Indonesia santai dan ramah, seperti ngobrol dengan teman.' }}

Tipe traveler pengguna: {{ traveler_type }}
{{ traveler_type === 'backpacker' ? 'Prioritaskan opsi hemat, transportasi umum, dan penginapan budget.' : '' }}
{{ traveler_type === 'family' ? 'Prioritaskan lokasi ramah anak, keamanan, dan kenyamanan.' : '' }}
{{ traveler_type === 'honeymoon' ? 'Prioritaskan suasana romantis dan privasi.' : '' }}
{{ traveler_type === 'kuliner' ? 'Prioritaskan rekomendasi tempat makan lokal dan otentik.' : '' }}

Preferensi makanan: {{ food_pref || 'tidak ada preferensi khusus' }}

Tugasmu:
1. Jika informasi dari pengguna belum lengkap (destinasi, durasi, budget), tanyakan dengan sopan satu per satu, jangan tanya semua sekaligus.
2. Setelah informasi cukup (minimal: destinasi + durasi + budget), berikan konfirmasi singkat lalu itinerary akan digenerate oleh sistem secara terpisah.
3. Jangan mengarang nama tempat yang tidak umum/tidak nyata. Jika ragu, sebutkan kategori tempat secara umum (misal "pasar tradisional di pusat kota") daripada nama spesifik yang tidak pasti.
4. Selalu sertakan estimasi biaya yang realistis untuk konteks Indonesia.
```

### 11.3 `response_schema` untuk Structured Output Itinerary

Gunakan Gemini structured output (`responseSchema` + `responseMimeType: "application/json"`):

```typescript
const itinerarySchema = {
  type: "object",
  properties: {
    destination: { type: "string" },
    total_budget_estimate: { type: "number" },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day_number: { type: "integer" },
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string" },
                location_name: { type: "string" },
                activity_description: { type: "string" },
                estimated_cost: { type: "number" }
              },
              required: ["time", "location_name", "activity_description", "estimated_cost"]
            }
          }
        },
        required: ["day_number", "activities"]
      }
    }
  },
  required: ["destination", "total_budget_estimate", "days"]
};
```

**Aturan penting untuk AI agent:** `latitude`/`longitude` TIDAK diminta dari Gemini (karena rawan halusinasi koordinat). Koordinat harus dicari terpisah menggunakan Nominatim (OpenStreetMap geocoding API, gratis) berdasarkan `location_name` + `destination`, baru disimpan ke `trip_activities`.

## 12. Alur Sistem End-to-End

```
1. User login/register (Supabase Auth)
2. User membuka halaman /chat, memilih persona (traveler_type) jika belum diset
3. User mengirim pesan → POST /api/chat
4. Backend ambil preferences + chat history dari Supabase
5. Backend panggil Gemini API (mode percakapan biasa) dengan system_instruction dinamis
6. Jika Gemini/backend logic mendeteksi info sudah cukup:
   a. Backend panggil Gemini API kedua kalinya dengan response_schema itinerary
   b. Backend geocode setiap location_name via Nominatim API untuk dapat lat/lon
   c. Backend simpan trip, trip_days, trip_activities ke Supabase
7. Backend simpan chat_messages (user + assistant)
8. Frontend render: chat bubble biasa, atau jika ada itinerary → render ItineraryCard + TripMap
9. User bisa buka /trips untuk lihat riwayat semua trip tersimpan
```

## 13. Integrasi Eksternal — Detail Teknis

### 13.1 Gemini API
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- Auth: API key di header `x-goog-api-key` atau query param `key`
- Rate limit free tier: perlu di-handle dengan retry + exponential backoff untuk error 429

### 13.2 Open-Meteo
- Endpoint: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
- Tidak butuh API key

### 13.3 Nominatim (Geocoding, untuk konversi location_name → lat/lon)
- Endpoint: `https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1`
- **Wajib** menyertakan header `User-Agent` custom sesuai kebijakan Nominatim
- Rate limit: maksimal 1 request/detik — jika generate itinerary dengan banyak lokasi, beri jeda antar request

## 14. Kriteria Penerimaan (Acceptance Criteria) MVP

- [ ] User dapat register dan login
- [ ] User dapat memilih persona traveler dan gaya bahasa
- [ ] User dapat chat dan bot merespons secara kontekstual (inget histori dalam sesi yang sama)
- [ ] Bot dapat generate itinerary terstruktur dalam format JSON valid sesuai schema
- [ ] Itinerary tersimpan ke database dan bisa dibuka kembali di halaman /trips
- [ ] Peta menampilkan marker sesuai lokasi itinerary
- [ ] Info cuaca tampil untuk destinasi yang direncanakan
- [ ] RLS aktif — user A tidak bisa mengakses data user B (harus diuji manual)

## 15. Batasan & Asumsi Eksplisit

- Data harga di itinerary adalah **estimasi**, bukan harga real-time/pasti — harus ada disclaimer di UI
- Koordinat lokasi bergantung pada akurasi Nominatim; jika geocoding gagal, field lat/lon boleh null dan marker tidak ditampilkan untuk lokasi tersebut (jangan crash)
- Aplikasi berjalan di free tier semua layanan — jika traffic tinggi, akan terkena rate limit (bukan skenario yang perlu di-handle di luar retry sederhana)

---

**Catatan untuk AI coding agent:** Ikuti struktur folder, skema database, dan kontrak API di dokumen ini secara persis. Jangan menambahkan tabel, endpoint, atau dependency baru yang tidak disebutkan di sini tanpa konfirmasi eksplisit dari user.
