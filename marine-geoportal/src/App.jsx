import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// Tambahan ikon Lock, LogOut, dan User untuk fitur Login
import { Map as MapIcon, Filter, Database, X, Check, Menu, Plus, Lock, LogOut, User } from 'lucide-react'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categories = ["Ecology", "Chemistry", "Oceanography", "Meteorology"];

export default function App() {
  const [activeFilters, setActiveFilters] = useState(categories);
  const [modalData, setModalData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 STATE UNTUK FITUR LOGIN & ADMIN
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', lat: '', lng: '', category: 'Oceanography', owner: '', description: '', method: 'Sensor Lapangan', status: 'Aktif', imageUrl: ''
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/stations')
      .then(response => response.json())
      .then(data => {
        setStations(data);
        setIsLoading(false);
      })
      .catch(error => console.error("Gagal menarik data dari backend:", error));
  }, []);

  const toggleFilter = (category) => {
    setActiveFilters(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredData = stations.filter(d => activeFilters.includes(d.category));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🚀 FUNGSI PROSES LOGIN
  const handleLogin = (e) => {
    e.preventDefault();
    // Kredensial Admin Sementara (Bisa kamu ubah sendiri)
    if (loginForm.username === 'admin' && loginForm.password === 'dbase') {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      setLoginForm({ username: '', password: '' }); // Bersihkan form
      alert("Login Berhasil! Mode Administrator Diaktifkan.");
    } else {
      alert("Akses Ditolak: Username atau Password salah!");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    alert("Berhasil Logout dari Mode Admin.");
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    
    let processedImageUrl = formData.imageUrl.trim();
    if (processedImageUrl.includes('drive.google.com')) {
      const match = processedImageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processedImageUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    if (processedImageUrl === '') {
      processedImageUrl = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=80';
    }

    try {
      const response = await fetch('http://localhost:5000/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          imageUrl: processedImageUrl
        })
      });
      const result = await response.json();
      
      setStations([...stations, result.data]);
      setIsAddModalOpen(false);
      setFormData({ name: '', lat: '', lng: '', category: 'Oceanography', owner: '', description: '', method: 'Sensor Lapangan', status: 'Aktif', imageUrl: '' });
      alert("Stasiun berhasil ditambahkan! Foto GDrive berhasil dikonversi.");
    } catch (error) {
      console.error("Gagal menambah data:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen text-slate-800">
      
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center z-[1000] shadow-md relative">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          <div className="bg-blue-500 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <MapIcon size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Marine Geoportal</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="flex gap-6 text-sm font-semibold text-slate-300 mr-2">
            <a href="#" className="text-white bg-white/10 px-4 py-2 rounded-lg transition">Dashboard</a>
          </nav>
          
          {/* 🚀 CONDITIONAL RENDERING: Cek apakah user sudah login sebagai Admin */}
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-blue-500/30"
              >
                <Plus size={18} /> Tambah Data
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
                title="Keluar dari mode Admin"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <Lock size={18} className="text-slate-400" /> Login Admin
            </button>
          )}
        </div>
      </header>

      {/* Main Content (Peta & Sidebar tetap sama) */}
      <div className="flex flex-1 overflow-hidden bg-slate-50 relative">
        <aside className={`w-80 bg-white border-r border-slate-200 flex flex-col z-[999] shadow-[8px_0_24px_-12px_rgba(0,0,0,0.1)] shrink-0 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : '-ml-80'}`}>
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 text-slate-800">
            <Filter size={20} strokeWidth={2.5} className="text-blue-600" />
            <h2 className="font-bold text-lg">Filter Data</h2>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Kategori Pemetaan</p>
            <div className="flex flex-col gap-3">
              {categories.map(cat => {
                const isActive = activeFilters.includes(cat);
                return (
                  <button key={cat} onClick={() => toggleFilter(cat)} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}>
                    <span className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-slate-600'}`}>{cat}</span>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isActive ? 'bg-blue-600' : 'bg-slate-200'}`}>
                      {isActive && <Check size={16} strokeWidth={3} className="text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6 bg-slate-50/80 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-white py-3 px-4 rounded-xl border border-slate-200 shadow-sm">
              <Database size={18} className="text-blue-500" />
              <span>Menampilkan <strong className="text-slate-900">{filteredData.length}</strong> titik aktif</span>
            </div>
          </div>
        </aside>

        <div className="flex-1 relative z-0">
          <MapContainer center={[-6.6, 110.5]} zoom={9} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
            <TileLayer attribution='&copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            
            {filteredData.map(data => (
              <Marker key={data.id} position={[data.lat, data.lng]}>
                <Popup className="rounded-xl p-0 overflow-hidden">
                  <div className="w-64">
                    <div className="mb-3 relative">
                      <img src={data.imageUrl} alt={data.name} className="w-full h-36 object-cover rounded-t-lg" />
                      <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 text-blue-700 text-[10px] font-extrabold uppercase rounded-md shadow-sm">{data.category}</span>
                    </div>
                    <div className="px-3 pb-3">
                      <h4 className="font-bold text-slate-800 text-[15px] mb-2 leading-snug">{data.name}</h4>
                      <button onClick={() => setModalData(data)} className="w-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-md">Lihat Metadata Penuh</button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* 🚀 MODAL LOGIN ADMIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <User size={24} className="text-blue-600"/> Akses Admin
              </h2>
              <button onClick={() => setIsLoginModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
                <input 
                  required type="text" 
                  value={loginForm.username} 
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="Masukkan username" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                <input 
                  required type="password" 
                  value={loginForm.password} 
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="••••••••" 
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl mt-2 shadow-lg transition">
                Masuk ke Sistem
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Data Baru (Form Tambah Data) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <Plus size={24} className="text-blue-600"/> Input Stasiun Baru
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddStation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Stasiun / Proyek</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Contoh: Pemantauan Arus Demak" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Latitude</label>
                  <input required type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="-6.9531" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Longitude</label>
                  <input required type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="110.4267" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pengelola</label>
                  <input required type="text" name="owner" value={formData.owner} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" placeholder="Tim Algomarine" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-600 mb-1">Link Foto (Paste langsung link Share GDrive)</label>
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="https://drive.google.com/file/d/... (Opsional)" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Deskripsi</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm h-16" placeholder="Keterangan stasiun..." />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-blue-500/30 transition">
                Simpan & Tampilkan di Peta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Metadata */}
      {modalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Database size={20} className="text-blue-600"/> Metadata Stasiun</h2>
              <button onClick={() => setModalData(null)} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2"><span className="text-slate-500">Nama Data</span><span className="col-span-2 font-semibold">{modalData.name}</span></div>
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2"><span className="text-slate-500">Kategori</span><span className="col-span-2"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">{modalData.category}</span></span></div>
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2"><span className="text-slate-500">Koordinat</span><span className="col-span-2 font-mono text-xs">{modalData.lat}, {modalData.lng}</span></div>
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2"><span className="text-slate-500">Pengelola</span><span className="col-span-2">{modalData.owner}</span></div>
              <div className="grid grid-cols-3"><span className="text-slate-500">Deskripsi</span><span className="col-span-2 text-slate-600">{modalData.description}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
