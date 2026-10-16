const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
// Menggunakan port dari server cloud, atau 5000 jika dijalankan lokal
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// GANTI TEKS DI BAWAH INI DENGAN LINK MONGODB DARI NOTEPAD KAMU
const mongoURI = "mongodb+srv://davaadriaramadhan1_db_user:aJVBdITJOfCMXTjB@marpot.q3zs0i9.mongodb.net/?compressors=zlib";

// Koneksi ke MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Berhasil terhubung ke MongoDB Atlas!'))
  .catch(err => console.log('Gagal terhubung ke MongoDB:', err));

// Membuat Skema/Format Data untuk Stasiun
const stationSchema = new mongoose.Schema({
  id: Number,
  name: String,
  lat: Number,
  lng: Number,
  category: String,
  status: String,
  imageUrl: String,
  description: String,
  owner: String,
  method: String
});

// Membuat Model dari Skema
const Station = mongoose.model('Station', stationSchema);

// API: Mengambil semua data stasiun (GET)
app.get('/api/stations', async (req, res) => {
  try {
    const stations = await Station.find(); // Ambil dari database
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data" });
  }
});

// API: Menyimpan data stasiun baru (POST)
app.post('/api/stations', async (req, res) => {
  try {
    const newStation = new Station(req.body);
    await newStation.save(); // Simpan permanen ke database
    res.json(newStation);
  } catch (error) {
    res.status(500).json({ message: "Gagal menyimpan data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server Backend berjalan di port ${PORT}`);
});
