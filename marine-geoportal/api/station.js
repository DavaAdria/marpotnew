// api/stations.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!redisUrl || !redisToken) {
    return res.status(500).json({ 
      error: 'Database Vercel (Upstash Redis) belum dihubungkan ke proyek ini.' 
    });
  }

  const DB_KEY = 'register_geoportal_stations';

  const getStations = async () => {
    const response = await fetch(`${redisUrl}/get/${DB_KEY}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
      cache: 'no-store'
    });
    const data = await response.json();
    if (!data.result) return [];
    return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
  };

  const saveStations = async (stationsArray) => {
    await fetch(`${redisUrl}/set/${DB_KEY}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stationsArray)
    });
  };

  try {
    // 1. AMBIL SEMUA DATA (GET)
    if (req.method === 'GET') {
      const stations = await getStations();
      return res.status(200).json(stations);
    }

    // 2. TAMBAH DATA BARU (POST)
    if (req.method === 'POST') {
      const stations = await getStations();
      const newStation = {
        ...req.body,
        id: req.body.id || Date.now()
      };
      const updated = [newStation, ...stations];
      await saveStations(updated);
      return res.status(201).json(newStation);
    }

    // 3. HAPUS DATA (DELETE)
    if (req.method === 'DELETE') {
      const { id } = req.query;
      const stations = await getStations();
      const updated = stations.filter(s => String(s.id) !== String(id));
      await saveStations(updated);
      return res.status(200).json({ message: 'Berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
