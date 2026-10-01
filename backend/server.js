const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let marineDatabase = [
  {
    id: 1,
    name: "Distribusi Mangrove Karimunjawa",
    lat: -5.8450, lng: 110.4350,
    category: "Ecology",
    status: "Tervalidasi",
    imageUrl: "https://images.unsplash.com/photo-1542281056-1144fb6b53a4?w=400&q=80",
    description: "Analisis tutupan lahan mangrove.",
    owner: "Tim Ekologi"
  },
  {
    id: 2,
    name: "Titik Sampling Pasir Besi",
    lat: -6.5055, lng: 110.7483,
    category: "Chemistry",
    status: "Aktif",
    imageUrl: "https://images.unsplash.com/photo-1584931423298-c576fda54bd2?w=400&q=80",
    description: "Lokasi pengambilan material nanokomposit.",
    owner: "Riset Pengembangan"
  },
  {
    id: 3,
    name: "Stasiun Pemantauan SST",
    lat: -6.8147, lng: 110.4150,
    category: "Meteorology",
    status: "Live",
    imageUrl: "https://images.unsplash.com/photo-1620210214811-137b2d19275e?w=400&q=80",
    description: "Stasiun pengukur Sea Surface Temperature.",
    owner: "Operasional"
  }
];

app.get('/api/stations', (req, res) => {
    res.status(200).json(marineDatabase);
});

app.listen(PORT, () => {
    console.log(`Backend Server Marine Geoportal menyala di http://localhost:${PORT}`);
});