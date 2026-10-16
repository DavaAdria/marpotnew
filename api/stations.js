import mongoose from 'mongoose';

// Ganti dengan link MongoDB kamu yang sudah ada passwordnya
const mongoURI = "mongodb+srv://davaadriaramadhan1_db_user:aJVBdITJOfCMXTjB@marpot.q3zs0i9.mongodb.net/?compressors=zlib";

// Mencegah koneksi berulang di Vercel
if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoURI).catch(err => console.error('Error MongoDB:', err));
}

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

const Station = mongoose.models.Station || mongoose.model('Station', stationSchema);

export default async function handler(req, res) {
  // Set header CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const stations = await Station.find();
      return res.status(200).json(stations);
    } catch (error) {
      return res.status(500).json({ message: 'Gagal mengambil data' });
    }
  } 

  if (req.method === 'POST') {
    try {
      const newStation = new Station(req.body);
      await newStation.save();
      return res.status(200).json(newStation);
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menyimpan data' });
    }
  }

  return res.status(405).json({ message: 'Method tidak diizinkan' });
}
