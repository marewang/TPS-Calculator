# Kalkulator Kapasitas (DAU • Concurrency • TPS)

Aplikasi web sederhana untuk menghitung DAU, Peak Concurrent, RPS per user, dan TPS total. Dibuat dengan **Vite + React + Tailwind** dan siap deploy ke **Vercel**.

## Menjalankan Lokal
```bash
npm install
npm run dev
```

## Build Production
```bash
npm run build
npm run preview
```

## Deploy ke Vercel
1. Push repo ini ke GitHub/GitLab/Bitbucket **atau** gunakan fitur **Deploy Project** di dashboard Vercel lalu upload ZIP build atau source.
2. Jika dari source:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output dir: `dist`
3. Selesai 🎉

> Catatan: Tailwind sudah dikonfigurasi. Tidak perlu set env khusus.
