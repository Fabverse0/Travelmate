# Design Specification — TravelMate

**Tujuan dokumen:** Mendefinisikan identitas visual TravelMate secara presisi — warna, tipografi, layout, komponen, dan state — supaya AI coding agent membangun UI yang konsisten dan tidak jatuh ke tampilan generik "AI-made" (card putih + shadow default + font sistem + accent biru/ungu tanpa alasan).

---

## 1. Konsep Dasar (Design Thesis)

TravelMate mengambil inspirasi visual dari **dokumen perjalanan fisik** — boarding pass, cap paspor, dan peta kertas lama — bukan dari template dashboard SaaS generik. Alasannya: produk ini soal *perjalanan yang direncanakan*, jadi tampilannya harus terasa seperti sedang menyusun dokumen perjalanan, bukan mengisi form aplikasi.

**Signature element:** Setiap itinerary yang selesai digenerate ditampilkan sebagai **kartu bergaya boarding pass** — ada garis putus-putus (perforasi) yang memisahkan bagian "ringkasan trip" dan "detail hari", meniru sobekan tiket. Ini elemen yang bikin orang inget "oh ini itu aplikasi TravelMate".

**Yang dihindari secara sadar:**
- Background krem (#F4F1EA) + font serif kontras + aksen terracotta (#D97757) — ini "tanda tangan" desain AI generik, harus dihindari eksplisit
- Card putih polos + box-shadow lembut tanpa border — pola dashboard SaaS default
- Aksen ungu/biru gradient tanpa alasan kontekstual
- Ikon emoji di UI

---

## 2. Palet Warna

Terinspirasi dari **peta topografi & tinta cap paspor** — biru laut tua sebagai warna utama (asosiasi perjalanan, kepercayaan), dengan aksen merah tinta cap (stempel/validasi) dan krem peta lama sebagai warna netral hangat (bukan putih polos).

| Token | Hex | Penggunaan |
|---|---|---|
| `--tm-ink-900` | `#152238` | Warna teks utama, header, elemen berat |
| `--tm-ink-700` | `#2C3E5C` | Teks sekunder, subheading |
| `--tm-sea-600` | `#1D5C7A` | Warna primer brand — tombol utama, link, highlight |
| `--tm-sea-100` | `#DCEAF0` | Background bubble chat dari bot, badge info |
| `--tm-stamp-600` | `#B8452F` | Aksen aksi/perhatian — badge budget, tombol hapus, notifikasi penting (dipakai HEMAT, jangan dominan) |
| `--tm-stamp-100` | `#F6E2DC` | Background badge peringatan/highlight ringan |
| `--tm-parchment-50` | `#F7F4EC` | Background halaman (pengganti putih polos — terasa seperti kertas peta) |
| `--tm-parchment-200` | `#E8E2D0` | Border kartu, garis pemisah, elemen perforasi |
| `--tm-sand-400` | `#C4B896` | Border sekunder, elemen dekoratif garis putus-putus |
| `--tm-success-600` | `#3F7D5C` | Status "trip final/tersimpan" |

**Dark mode:** Ink dan parchment bertukar peran — background jadi `#131B26` (biru gelap keabuan, bukan hitam pekat), teks jadi `#EDE7D8` (parchment terang). Sea tetap jadi aksen primer tapi dinaikkan ke `#4A9BC0` supaya kontras cukup.

**Aturan pemakaian:**
- Maksimal 2 warna aksen aktif dalam satu layar (sea + stamp), sisanya netral
- `--tm-stamp-600` hanya untuk elemen yang benar-benar butuh perhatian (bukan dekorasi) — misal badge "budget melebihi target"
- Jangan pakai gradient di manapun

---

## 3. Tipografi

| Role | Font | Alasan |
|---|---|---|
| Display / heading (`h1`, `h2`, judul trip) | **Fraunces** (serif, variable) | Punya karakter "dicetak" seperti judul di tiket/dokumen perjalanan lama, tidak generik seperti Playfair yang sudah terlalu sering dipakai AI |
| Body / UI text | **Inter** | Netral, sangat legible di ukuran kecil untuk chat bubble dan form |
| Monospace (kode booking, angka budget, koordinat) | **IBM Plex Mono** | Kesan "tiket tercetak" — dipakai khusus untuk nomor/kode, bukan body text biasa |

**Skala tipe:**
```
h1 (judul halaman)       32px / 600 / Fraunces / line-height 1.2
h2 (judul trip/card)     22px / 600 / Fraunces / line-height 1.3
h3 (subjudul section)    17px / 600 / Inter    / line-height 1.4
body                     15px / 400 / Inter    / line-height 1.6
caption/meta             13px / 400 / Inter    / line-height 1.5, warna --tm-ink-700
mono (angka/kode)        14px / 500 / IBM Plex Mono
```

Judul trip di halaman `/trips` dan header itinerary card WAJIB pakai Fraunces — ini yang membedakan TravelMate dari chatbot generik yang semua teksnya sans-serif rata.

---

## 4. Layout & Wireframe

### 4.1 Halaman Chat (`/chat`) — halaman utama

```
┌─────────────────────────────────────────────────┐
│  [Logo TravelMate]      [Persona: Kuliner ▾]  [⚙] │  ← header, 56px, border-bottom parchment-200
├─────────────────────────────────────────────────┤
│                                                   │
│   ┌───────────────────────────┐                 │
│   │ Bot bubble (sea-100 bg)    │                 │  ← align kiri, max-width 65%
│   │ "Mau liburan kemana nih?"  │                 │
│   └───────────────────────────┘                 │
│                                                   │
│                 ┌───────────────────────────┐   │
│                 │ User bubble (ink-900 bg,   │   │  ← align kanan, teks parchment
│                 │  teks putih)                │   │
│                 └───────────────────────────┘   │
│                                                   │
│   ┌─────────────────────────────────────────┐   │
│   │  ▨▨▨ ITINERARY CARD (boarding pass) ▨▨▨  │   │  ← full width chat area, style khusus (lihat 5.1)
│   └─────────────────────────────────────────┘   │
│                                                   │
├─────────────────────────────────────────────────┤
│  [Ketik pesan...................]        [Kirim] │  ← input bar sticky bottom, 64px
└─────────────────────────────────────────────────┘
```

- Lebar chat area maksimal 720px, di-center di layar desktop (bukan full-bleed)
- Bubble bot: background `--tm-sea-100`, teks `--tm-ink-900`, radius 16px tapi sudut kiri-bawah 4px (memberi kesan "arah bicara")
- Bubble user: background `--tm-ink-900`, teks `--tm-parchment-50`, sudut kanan-bawah 4px
- Tidak ada avatar bulat generik — cukup label kecil "TravelMate" di atas bubble pertama tiap grup pesan bot

### 4.2 Halaman Riwayat Trip (`/trips`)

```
┌─────────────────────────────────────────────────┐
│  Riwayat perjalanan                              │  ← h1 Fraunces
├─────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │ Trip card │  │ Trip card │  │ Trip card │    │  ← grid 3 kolom desktop, 1 kolom mobile
│  │  (4.3)    │  │  (4.3)    │  │  (4.3)    │    │
│  └───────────┘  └───────────┘  └───────────┘    │
└─────────────────────────────────────────────────┘
```

### 4.3 Trip Summary Card (dipakai di grid /trips)

- Background `--tm-parchment-50`, border 1px solid `--tm-parchment-200`, radius 12px
- Bagian atas: nama destinasi (Fraunces, 18px), tanggal (mono, 13px, `--tm-ink-700`)
- Garis perforasi horizontal (lihat 5.1) memisahkan header dari footer
- Footer: badge status (draft/final) + total budget dalam mono font
- Hover: border berubah ke `--tm-sea-600`, tanpa shadow (flat, sesuai prinsip no-shadow-default)

---

## 5. Komponen Kunci

### 5.1 Itinerary Card (Signature Element — Boarding Pass Style)

Ini komponen paling penting secara visual. Spesifikasi presisi:

```
┌───────────────────────────────────────────────┐
│  YOGYAKARTA                        3 HARI      │  ← Fraunces 20px ink-900 | mono 12px ink-700, uppercase, letter-spacing 0.05em
│  15–17 Agt 2026                                │  ← mono 13px
│ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄  │  ← garis putus-putus, border-top: 2px dashed --tm-sand-400
│                                                 │
│  HARI 1                                        │  ← h3, ink-700, uppercase
│  09:00  Malioboro — jalan pagi & sarapan        │  ← waktu dalam mono, lokasi dalam Inter
│         Rp 50.000                              │  ← mono, --tm-stamp-600 jika mendekati/lewat budget harian
│  11:00  Keraton Yogyakarta                      │
│         Rp 15.000                              │
│                                                 │
│ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄  │
│  ESTIMASI TOTAL              Rp 1.450.000      │  ← footer, label ink-700 13px, angka mono 18px 600 sea-600
└───────────────────────────────────────────────┘
```

- Background: `--tm-parchment-50`
- Border: 1.5px solid `--tm-parchment-200`, radius 14px
- Garis perforasi: **bukan** `border-bottom: dashed` biasa — implementasikan sebagai deretan lingkaran kecil 4px (`--tm-sand-400`) berulang tiap 10px untuk kesan "sobekan tiket" yang lebih otentik daripada border-dashed CSS standar
- Padding internal 20px, jarak antar aktivitas 12px
- TIDAK ada box-shadow. Kedalaman hanya dari border + sedikit perbedaan warna background dengan halaman

### 5.2 Chat Input Bar

- Sticky di bawah, background `--tm-parchment-50`, border-top 1px `--tm-parchment-200`
- Input field: radius 20px (pill), border 1px `--tm-sand-400`, focus ring `--tm-sea-600`
- Tombol kirim: bukan ikon pesawat kertas generik — pakai label teks "Kirim" dengan background `--tm-sea-600`, radius pill, teks putih. Ikon panah kecil (Tabler `ti-arrow-right`) di kanan label, bukan ikon berdiri sendiri

### 5.3 Persona Selector (dropdown di header)

- Bukan dropdown default browser — custom pill button dengan label persona aktif + chevron
- Saat dibuka: panel dengan 4 opsi (Backpacker, Family, Honeymoon, Kuliner), masing-masing dengan 1 baris deskripsi singkat, bukan cuma nama
- Opsi aktif ditandai border `--tm-sea-600` 2px (bukan background solid penuh, biar konsisten sama aturan "aksen 2px untuk highlight" di card lain)

### 5.4 Weather Badge (inline dalam chat/itinerary)

- Pill kecil, background `--tm-sea-100`, teks `--tm-sea-600` (gunakan stop gelap dari ramp sea untuk kontras)
- Format: `<ikon cuaca> 27°C · Cerah berawan` dalam mono font untuk angka

### 5.5 Map (Leaflet)

- Style tile: gunakan tile OSM standar tapi beri filter CSS `sepia(8%) saturate(85%)` supaya nuansa peta selaras dengan tema parchment/vintage map, bukan peta biru-hijau default yang terasa lepas dari desain sekitarnya
- Marker: custom pin bentuk tetes dengan warna `--tm-stamp-600` (bukan marker default Leaflet biru)
- Garis rute antar lokasi: `--tm-sea-600`, dashed, weight 3

---

## 6. Spacing & Radius

```
--tm-space-1: 4px
--tm-space-2: 8px
--tm-space-3: 12px
--tm-space-4: 16px
--tm-space-5: 24px
--tm-space-6: 32px

--tm-radius-sm: 8px    (badge, input kecil)
--tm-radius-md: 14px   (card)
--tm-radius-pill: 999px (button, input chat, badge)
```

---

## 7. Motion

Dipakai minimal dan bertarget, bukan dekorasi di semua tempat:

- **Chat bubble muncul:** fade + translateY(8px→0), durasi 200ms, ease-out. Ini satu-satunya animasi yang terjadi berulang, jadi harus halus dan cepat
- **Itinerary card generate:** saat card pertama kali muncul setelah bot selesai generate, beri efek "unfold" ringan (scaleY dari 0.95 ke 1 + fade), durasi 300ms — momen ini boleh terasa sedikit lebih "spesial" karena ini adalah hasil utama produk
- **Hover card trip:** transisi border-color 150ms, tanpa transform/scale
- Tidak ada animasi loading spinner generik — gunakan skeleton dengan garis-garis mono berkedip pelan (opacity 0.4↔0.7, 1.2s loop) menyerupai teks yang sedang "dicetak"

---

## 8. Voice & Microcopy

Konsisten dengan gaya bahasa yang dipilih user (formal/santai), tapi UI chrome (tombol, label sistem, error) tetap punya aturan baku:

- Sentence case selalu — "Simpan trip", bukan "Simpan Trip" atau "SIMPAN TRIP"
- Tombol pakai kata kerja aktif: "Simpan trip", "Hapus percakapan", bukan "OK"/"Submit"
- Empty state halaman `/trips` saat belum ada trip: **"Belum ada perjalanan tersimpan."** + subteks **"Mulai ngobrol di chat untuk menyusun trip pertamamu."** + tombol "Mulai chat →" — bukan generic "No data found"
- Error (misal Gemini API gagal): **"Gagal memproses pesan. Coba kirim ulang."** — jangan expose raw error message ke user

---

## 9. Checklist Anti-Generic (dicek sebelum implementasi dianggap selesai)

- [ ] Tidak ada background krem + aksen terracotta (kombinasi khas AI-generated)
- [ ] Tidak ada box-shadow lembut di card — semua kedalaman dari border
- [ ] Judul trip & itinerary pakai Fraunces, bukan Inter/system font di semua tempat
- [ ] Marker peta custom, bukan pin biru default Leaflet
- [ ] Garis perforasi itinerary card pakai pola lingkaran custom, bukan `border-dashed` polos
- [ ] Tombol kirim chat pakai label teks, bukan hanya ikon
- [ ] Tidak ada emoji di UI (pakai Tabler icons outline)
- [ ] Maksimal 2 warna aksen aktif per layar

---

**Catatan untuk AI coding agent:** Semua nilai warna, radius, dan spacing di atas didefinisikan sebagai CSS custom properties dengan prefix `--tm-*` di `globals.css`, lalu direferensikan di seluruh komponen — jangan hardcode hex value langsung di komponen manapun.
