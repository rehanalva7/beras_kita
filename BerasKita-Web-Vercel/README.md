# BerasKita

Web sederhana sistem manajemen penjualan beras berdasarkan PRD.

## Fitur

- Registrasi dan login pembeli
- Katalog produk dan stok
- Keranjang, checkout, dan invoice cetak
- Riwayat pembelian
- Dashboard admin
- CRUD produk dan pengelolaan stok
- Data pelanggan dan transaksi
- Laporan penjualan sederhana

## Menjalankan secara lokal

Karena aplikasi ini memakai HTML, CSS, dan JavaScript murni, buka `index.html`
langsung di browser atau jalankan server statis:

```powershell
npx serve .
```

## Akun demo

- Admin: `admin@beraskita.id` / `admin123`
- Pembeli: `demo@beraskita.id` / `demo123`

## Deploy ke Vercel

1. Masuk ke akun Vercel.
2. Buat proyek baru dan impor folder/repository ini.
3. Pilih Framework Preset `Other`.
4. Biarkan Build Command kosong.
5. Isi Output Directory dengan `.` bila diminta.
6. Klik Deploy.

Alternatif dengan Vercel CLI:

```powershell
npx vercel
```

Ikuti pertanyaan di layar, lalu gunakan:

- Set up and deploy: `Y`
- Scope: pilih akun Anda
- Link to existing project: `N`
- Project name: `beraskita`
- Directory: `.`
- Modify settings: `N`

Untuk deployment produksi:

```powershell
npx vercel --prod
```

## Catatan teknis

Versi ini menyimpan data di `localStorage` browser agar sederhana dan dapat
langsung dipasang tanpa backend. Data tidak tersinkron antarperangkat dan dapat
hilang jika penyimpanan browser dibersihkan. Untuk penggunaan produksi,
autentikasi dan data perlu dipindahkan ke database seperti Supabase atau
PostgreSQL.
