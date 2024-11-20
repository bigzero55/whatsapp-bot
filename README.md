# Asro (Asisten Rojak) - WhatsApp AI Bot

Asro adalah asisten virtual berbasis AI yang diintegrasikan dengan WhatsApp. Bot ini menggunakan Google Gemini AI untuk memberikan respons cerdas dan kontekstual terhadap pesan pengguna.

## 🌟 Fitur

- 🤖 Respons AI yang cerdas menggunakan Google Gemini Pro
- 💬 Pemrosesan bahasa natural yang canggih
- ⚡ Respons real-time untuk pesan WhatsApp
- 🔄 Koneksi otomatis dan penanganan error
- 🔐 Konfigurasi berbasis environment
- 🎯 Mode AI yang dapat diaktifkan/nonaktifkan

## 📋 Prasyarat

- Node.js (versi LTS terbaru)
- npm (Node Package Manager)
- Akun Google Cloud dengan akses Gemini API
- Akun WhatsApp aktif

## 🚀 Instalasi

1. Clone repositori:
```bash
git clone <repository-url>
cd whatsapp-bot
```

2. Install dependensi:
```bash
npm install
```

3. Buat file `.env` berdasarkan `.env.example`:
```bash
cp .env.example .env
```

4. Konfigurasi variabel environment di `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
YOUR_NAME=your_name_here
```

## 🎮 Penggunaan

1. Mulai bot dalam mode development:
```bash
npm run dev
```

2. Untuk production:
```bash
npm start
```

3. Scan QR code yang muncul di terminal dengan WhatsApp untuk menghubungkan akun.

### Perintah Bot

- `/ai on` - Mengaktifkan mode AI
- `/ai off` - Menonaktifkan mode AI

## 🛠️ Teknologi

- Backend: Node.js
- WhatsApp Client: @whiskeysockets/baileys
- AI: Google Gemini AI (@google/generative-ai)
- Logging: pino & pino-pretty
- Development: nodemon

## 📁 Struktur Proyek

```
whatsapp-bot/
├── index.js           # File utama aplikasi
├── .env              # Konfigurasi environment
├── .env.example      # Contoh konfigurasi environment
├── package.json      # Dependensi dan skrip
├── nodemon.json      # Konfigurasi development
└── logs/            # Direktori log
```

## 🔒 Keamanan

- Menggunakan variabel environment untuk data sensitif
- Autentikasi sesi WhatsApp yang aman
- Tidak menyimpan data pesan pengguna

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau laporkan issue.

## 📝 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## 👨‍💻 Pengembang

Dibuat oleh Abdul Rojak - Fullstack Developer

## ⚠️ Troubleshooting

1. Jika bot tidak dapat terhubung:
   - Pastikan internet stabil
   - Hapus folder `auth_info_baileys`
   - Restart bot dan scan ulang QR code

2. Jika AI tidak merespons:
   - Periksa GEMINI_API_KEY
   - Pastikan mode AI aktif (/ai on)
   - Periksa log untuk error detail

3. Masalah umum lainnya:
   - Periksa file log di folder `logs`
   - Pastikan semua dependensi terinstal
   - Verifikasi konfigurasi environment
