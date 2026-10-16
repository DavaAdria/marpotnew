import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
// Ikon Instagram DICABUT DARI SINI karena sudah dihapus oleh pihak Lucide v1.0
import { 
  Filter, Database, X, Check, Menu, Plus, LogOut, User, 
  Globe, Moon, Sun, Droplet, Mail, MessageCircle
} from 'lucide-react'; 
// Dan dipindahkan ke SINI menggunakan lucide-brands
import { Instagram } from 'lucide-brands';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapResizer({ isSidebarOpen }) {
  const map = useMap();
  (() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map, isSidebarOpen]);
  return null;
}

const categories = ["Ecology", "Chemistry", "Oceanography", "Meteorology"];

const initialData = [
  { id: 1, name: "Distribusi Mangrove Karimunjawa", lat: -5.8450, lng: 110.4350, category: "Ecology", status: "Tervalidasi", imageUrl: "https://images.unsplash.com/photo-1542281056-1144fb6b53a4?w=400&q=80", description: "Analisis tutupan lahan dan tingkat dominansi spesies mangrove.", owner: "Tim Riset Ekologi", method: "Citra Satelit" },
  { id: 2, name: "Titik Sampling Pasir Besi", lat: -6.5055, lng: 110.7483, category: "Chemistry", status: "Aktif", imageUrl: "https://images.unsplash.com/photo-1584931423298-c576fda54bd2?w=400&q=80", description: "Lokasi pengambilan material nanokomposit.", owner: "Riset & Pengembangan", method: "Spektrofotometri" },
  { id: 3, name: "Stasiun Pemantauan SST", lat: -6.8147, lng: 110.4150, category: "Meteorology", status: "Live", imageUrl: "https://images.unsplash.com/photo-1620210214811-137b2d19275e?w=400&q=80", description: "Stasiun pengukur Sea Surface Temperature.", owner: "Divisi Operasional", method: "Sensor Pelampung" }
];

const dict = {
  id: {
    title: "Register Geoportal (Re-Port)", dashboard: "Dasbor", stations: "Stasiun Peta",
    adminLogin: "Login Admin", logout: "Keluar", addData: "Tambah Data",
    aboutTitle: "Tentang Register Geoportal (Re-Port)",
    aboutDesc: "Register Geoportal (Re-port) merupakan sebuah portal yang memuat data mengenai informasi geospasial kelautan yang dirancang oleh Register Undip sebagai bahan pembelajaran dan edukasi mahasiswa mengenai penginderaan jauh dan sistem informasi geografi dalam lingkup kelautan. Geoportal ini mengatur dan menyediakan layanan, pencarian, dan akses untuk informasi geospasial kelautan.",
    contactUs: "Hubungi Kami",
    filterTitle: "Filter Data", showing: "Menampilkan", activeSpots: "titik aktif",
    mapCategory: "Kategori Pemetaan", fullMeta: "Lihat Metadata Penuh",
    modalAddTitle: "Input Stasiun Baru", saveBtn: "Simpan & Tampilkan",
    nameLabel: "Nama Stasiun / Proyek", lat: "Latitude", lng: "Longitude",
    category: "Kategori", owner: "Pengelola", desc: "Deskripsi", photo: "Link Foto (URL GDrive)",
    loginSuccess: "Login Berhasil! Mode Administrator Diaktifkan.",
    loginFail: "Akses Ditolak: Username atau Password salah!",
    saveSuccess: "Berhasil! Data tersimpan dengan aman di memori lokal aplikasimu."
  },
  en: {
    title: "Register Geoportal (Re-Port)", dashboard: "Dashboard", stations: "Map Stations",
    adminLogin: "Admin Login", logout: "Logout", addData: "Add Data",
    aboutTitle: "About Register Geoportal (Re-Port)", aboutSub: "Interactive Oceanographic Monitoring Platform",
    aboutDesc: "Register Geoportal (Re-port) is a portal containing data on marine geospatial information designed by Register Undip as learning and educational material for students regarding remote sensing and geographic information systems within the marine scope. This geoportal manages and provides services, searches, and access to marine geospatial information.",
    contactUs: "Contact Us",
    filterTitle: "Data Filter", showing: "Showing", activeSpots: "active spots",
    mapCategory: "Mapping Category", fullMeta: "View Full Metadata",
    modalAddTitle: "Input New Station", saveBtn: "Save & Display",
    nameLabel: "Station / Project Name", lat: "Latitude", lng: "Longitude",
    category: "Category", owner: "Manager", desc: "Description", photo: "Photo Link (GDrive URL)",
    loginSuccess: "Login Successful! Administrator Mode Activated.",
    loginFail: "Access Denied: Incorrect Username or Password!",
    saveSuccess: "Success! Data safely stored in your local application memory."
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('id');
  const t = dict[lang];

  const [activeFilters, setActiveFilters] = useState(categories);
  const [modalData, setModalData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stations, setStations] = useState([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', lat: '', lng: '', category: 'Oceanography', owner: '', description: '', method: 'Sensor Lapangan', status: 'Aktif', imageUrl: ''
  });

  useEffect(() => {
  fetch('/api/stations')
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        setStations(data);
      } else {
        setStations(initialData);
      }
    })
    .catch(err => {
      console.error('Gagal mengambil data:', err);
      setStations(initialData);
    });
}, []);

  useEffect(() => {
    if (activeTab === 'stations') {
      setIsSidebarOpen(false);
    }
  }, [activeTab]);

  const toggleFilter = (category) => {
    setActiveFilters(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const filteredData = stations.filter(d => activeFilters.includes(d.category));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'dbase') {
      setIsAdmin(true); setIsLoginModalOpen(false); setLoginForm({ username: '', password: '' });
      alert(t.loginSuccess);
    } else {
      alert(t.loginFail);
    }
  };

  const handleLogout = () => { setIsAdmin(false); };

   const handleAddStation = async (e) => {
    e.preventDefault();
    let processedImageUrl = formData.imageUrl.trim();
    if (processedImageUrl.includes('drive.google.com')) {
      const match = processedImageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) processedImageUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    if (processedImageUrl === '') processedImageUrl = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=80';
  
    const newStation = { 
      id: Date.now(), 
      ...formData, 
      lat: parseFloat(formData.lat), 
      lng: parseFloat(formData.lng), 
      imageUrl: processedImageUrl 
    };
  
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStation)
      });
      
      if (res.ok) {
        const savedStation = await res.json();
        setStations(prev => [...prev, savedStation]);
        setIsAddModalOpen(false);
        setFormData({ name: '', lat: '', lng: '', category: 'Oceanography', owner: '', description: '', method: 'Sensor Lapangan', status: 'Aktif', imageUrl: '' });
        setActiveTab('stations');
        alert(t.saveSuccess);
      } else {
        alert('Gagal menyimpan data.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const theme = {
    bgApp: isDark ? 'bg-slate-900' : 'bg-slate-50',
    textMain: isDark ? 'text-slate-100' : 'text-slate-800',
    bgNav: isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200',
    bgCard: isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700',
    bgSidebar: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
    bgFilterItem: isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-100 hover:bg-slate-50',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-x-hidden font-sans transition-colors duration-300 ${theme.bgApp} ${theme.textMain}`}>
      
      <header className={`${theme.bgNav} border-b px-3 sm:px-6 py-2.5 sm:py-4 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center z-[1000] shadow-sm w-full shrink-0`}>
        <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-3 sm:gap-6">
          <div className="flex items-center gap-2 shrink-0">
            {/* GAMBAR LOGO KUSTOM */}
            {/* Pastikan file logo.png milikmu sudah diletakkan di dalam folder `public` */}
            <img src="/marpot_logo.png" alt="Marpot Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <h1 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-blue-600 truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">
              {t.title}
            </h1>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold justify-center gap-1 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 sm:px-6 py-1.5 rounded-lg transition text-center ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : theme.textMuted}`}
            >
              {t.dashboard}
            </button>
            <button 
              onClick={() => setActiveTab('stations')}
              className={`px-4 sm:px-6 py-1.5 rounded-lg transition text-center ${activeTab === 'stations' ? 'bg-blue-600 text-white shadow-sm' : theme.textMuted}`}
            >
              {t.stations}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end w-full md:w-auto gap-1.5 sm:gap-3 text-xs sm:text-sm mt-2 sm:mt-0">
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border font-bold text-xs sm:text-sm ${theme.bgCard} hover:border-blue-500 transition`}>
            <Globe size={13} className="sm:w-4 sm:h-4" /> {lang.toUpperCase()}
          </button>
          <button onClick={() => setIsDark(!isDark)} className={`p-1.5 rounded-lg border ${theme.bgCard} hover:text-blue-500 transition`}>
            {isDark ? <Sun size={14} className="sm:w-4 sm:h-4" /> : <Moon size={14} className="sm:w-4 sm:h-4" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative w-full">
        
        {activeTab === 'dashboard' && (
          <div className={`flex-1 overflow-y-auto ${theme.bgApp} p-4 sm:p-8 md:p-16 flex flex-col items-center animate-in fade-in duration-500 w-full`}>
            <div className="max-w-4xl w-full text-center mb-10 sm:mb-16">
              
              {/* GAMBAR LOGO KUSTOM DI HALAMAN TENTANG */}
              {/* Pastikan file logo.png milikmu sudah diletakkan di dalam folder `public` */}
              <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
                 <img src="/marpot_logo.png" alt="Register Undip Logo Large" className="w-20 h-20 sm:w-28 sm:h-28 object-contain opacity-90 drop-shadow-lg" />
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">{t.aboutTitle}</h1>
              <p className={`text-sm sm:text-xl ${theme.textMuted}`}>{t.aboutSub}</p>
              
              <div className={`mt-6 sm:mt-12 p-4 sm:p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl border border-slate-100 dark:border-slate-700 text-center sm:text-left leading-relaxed text-xs sm:text-base md:text-lg max-w-full overflow-hidden`}>
                <p className="break-words">{t.aboutDesc}</p>
              </div>
            </div>

            {/* CONTACT US SECTION */}
            <div className="max-w-4xl w-full mb-12">
              <h2 className="text-lg sm:text-2xl font-bold mb-6 sm:mb-8 text-center">{t.contactUs}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
                
                {/* Email Card */}
                <a href="mailto:registerundip@gmail.com" className={`p-4 sm:p-6 rounded-xl border flex flex-col items-center justify-center gap-3 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all hover:border-blue-500 ${theme.bgCard}`}>
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-3 sm:p-4 rounded-full text-blue-600">
                    <Mail size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Email</h3>
                    <p className={`text-xs sm:text-sm mt-1 break-all ${theme.textMuted}`}>registerundip@gmail.com</p>
                  </div>
                </a>

                {/* Instagram Card */}
                <a href="https://instagram.com/register_undip" target="_blank" rel="noreferrer" className={`p-4 sm:p-6 rounded-xl border flex flex-col items-center justify-center gap-3 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all hover:border-pink-500 ${theme.bgCard}`}>
                  <div className="bg-pink-100 dark:bg-pink-900/50 p-3 sm:p-4 rounded-full text-pink-600">
                    <Instagram size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Instagram</h3>
                    <p className={`text-xs sm:text-sm mt-1 ${theme.textMuted}`}>@register_undip</p>
                  </div>
                </a>

                {/* WhatsApp Card */}
                <a href="https://wa.me/6283865131284" target="_blank" rel="noreferrer" className={`p-4 sm:p-6 rounded-xl border flex flex-col items-center justify-center gap-3 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all hover:border-green-500 ${theme.bgCard}`}>
                  <div className="bg-green-100 dark:bg-green-900/50 p-3 sm:p-4 rounded-full text-green-600">
                    <MessageCircle size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">WhatsApp</h3>
                    <p className={`text-xs sm:text-sm mt-1 ${theme.textMuted}`}>083865131284 (Dava)</p>
                  </div>
                </a>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'stations' && (
          <div className="flex flex-1 w-full relative animate-in fade-in zoom-in-95 duration-300">
            {isSidebarOpen && (
              <div 
                onClick={() => setIsSidebarOpen(false)} 
                className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1999]"
              />
            )}

            <aside className={`fixed md:relative inset-y-0 left-0 z-[2000] md:z-[999] w-72 sm:w-80 flex flex-col shadow-2xl md:shadow-xl shrink-0 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0 ml-0' : '-translate-x-full md:-ml-80'} ${theme.bgSidebar}`}>
              <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-blue-500" />
                  <h2 className="font-bold text-base sm:text-lg">{t.filterTitle}</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"><X size={20}/></button>
              </div>
              
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${theme.textMuted}`}>{t.mapCategory}</p>
                <div className="flex flex-col gap-2.5 sm:gap-3 mb-6">
                  {categories.map(cat => {
                    const isActive = activeFilters.includes(cat);
                    return (
                      <button key={cat} onClick={() => toggleFilter(cat)} className={`flex items-center justify-between w-full px-3.5 py-2.5 sm:py-3 rounded-xl border-2 transition-all ${isActive ? 'bg-blue-500/10 border-blue-500' : theme.bgFilterItem}`}>
                        <span className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-blue-500' : theme.textMuted}`}>{cat}</span>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center transition-colors ${isActive ? 'bg-blue-500' : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`}>
                          {isActive && <Check size={14} strokeWidth={3} className="text-white sm:w-4 sm:h-4" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={`p-4 sm:p-6 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
                <div className="flex flex-col gap-3">
                  <div className={`flex items-center justify-center gap-2 text-xs sm:text-sm font-medium py-2.5 sm:py-3 px-3 rounded-xl border shadow-sm ${theme.bgCard}`}>
                    <Database size={16} className="text-blue-500" />
                    <span>{t.showing} <strong>{filteredData.length}</strong> {t.activeSpots}</span>
                  </div>
                  
                  {isAdmin ? (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setIsAddModalOpen(true)} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm">
                        <Plus size={16} /> {t.addData}
                      </button>
                      <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm">
                        <LogOut size={16} /> {t.logout}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setIsLoginModalOpen(true)} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm text-sm">
                      <User size={16} /> {t.adminLogin}
                    </button>
                  )}
                </div>
              </div>
            </aside>

            <div className="flex-1 relative z-0 h-full w-full">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-[999] p-2.5 rounded-xl shadow-lg border focus:outline-none transition-all ${theme.bgCard} hover:text-blue-500 active:scale-95`}
                aria-label="Toggle Menu"
              >
                <Menu size={20} className="sm:w-6 sm:h-6" />
              </button>
              
              <MapContainer 
                center={[-6.6, 110.5]} 
                zoom={9} 
                zoomControl={false} 
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, height: '100%', width: '100%' }}
              >
                <MapResizer isSidebarOpen={isSidebarOpen} />
                <ZoomControl position="bottomright" />
                <TileLayer attribution='&copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                
                {filteredData.map(data => (
                  <Marker key={data.id} position={[data.lat, data.lng]}>
                    <Popup className={`rounded-xl p-0 overflow-hidden ${isDark ? 'dark-popup' : ''}`}>
                      <div className={`w-56 sm:w-64 ${isDark ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <div className="mb-2 sm:mb-3 relative">
                          <img src={data.imageUrl} alt={data.name} className="w-full h-28 sm:h-36 object-cover rounded-t-lg" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-blue-700 text-[9px] sm:text-[10px] font-extrabold uppercase rounded shadow-sm">{data.category}</span>
                        </div>
                        <div className="px-3 pb-3">
                          <h4 className="font-bold text-xs sm:text-[15px] mb-2 leading-snug">{data.name}</h4>
                          <button onClick={() => setModalData(data)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors shadow-md">{t.fullMeta}</button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}
      </div>

      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
          <div className={`${theme.bgCard} rounded-2xl w-full max-w-sm shadow-2xl p-5 sm:p-6 border ${isDark ? 'border-slate-700' : 'border-white'}`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2"><User size={20} className="text-cyan-500"/> {t.adminLogin}</h2>
              <button onClick={() => setIsLoginModalOpen(false)} className={`p-1 rounded-full hover:bg-red-500 hover:text-white transition`}><X size={18} /></button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">Username</label>
                <input required type="text" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className={`w-full p-2.5 sm:p-3 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="admin" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">Password</label>
                <input required type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className={`w-full p-2.5 sm:p-3 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2.5 sm:py-3 rounded-xl mt-2 shadow-lg transition text-sm">Login</button>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[3000] flex items-center justify-center p-3 sm:p-4">
          <div className={`${theme.bgCard} rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto border ${isDark ? 'border-slate-700' : 'border-white'}`}>
            <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2"><Plus size={22} className="text-cyan-500"/> {t.modalAddTitle}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full hover:bg-red-500 hover:text-white transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddStation} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">{t.nameLabel}</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div><label className="block text-xs font-bold mb-1 opacity-70">{t.lat}</label><input required type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`} /></div>
                <div><label className="block text-xs font-bold mb-1 opacity-70">{t.lng}</label><input required type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-70">{t.category}</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold mb-1 opacity-70">{t.owner}</label><input required type="text" name="owner" value={formData.owner} onChange={handleInputChange} className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`} /></div>
              </div>
              <div><label className="block text-xs font-bold mb-1 text-cyan-500">{t.photo}</label><input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`} /></div>
              <div><label className="block text-xs font-bold mb-1 opacity-70">{t.desc}</label><textarea required name="description" value={formData.description} onChange={handleInputChange} className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-cyan-500 h-16 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`} /></div>
              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2.5 sm:py-3 rounded-xl mt-3 shadow-lg shadow-cyan-500/30 transition text-sm">{t.saveBtn}</button>
            </form>
          </div>
        </div>
      )}

      {modalData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[4000] flex items-center justify-center p-4">
          <div className={`${theme.bgCard} rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 border ${isDark ? 'border-slate-700' : 'border-white'}`}>
            <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2"><Database size={18} className="text-blue-500"/> Metadata</h2>
              <button onClick={() => setModalData(null)} className="p-1 rounded-full hover:bg-red-500 hover:text-white transition"><X size={18} /></button>
            </div>
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}><span className="opacity-70">Nama Data</span><span className="col-span-2 font-bold">{modalData.name}</span></div>
              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}><span className="opacity-70">Kategori</span><span className="col-span-2"><span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">{modalData.category}</span></span></div>
              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}><span className="opacity-70">Koordinat</span><span className="col-span-2 font-mono text-xs">{modalData.lat}, {modalData.lng}</span></div>
              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}><span className="opacity-70">Pengelola</span><span className="col-span-2">{modalData.owner}</span></div>
              <div className="grid grid-cols-3"><span className="opacity-70">Deskripsi</span><span className="col-span-2">{modalData.description}</span></div>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .dark-popup .leaflet-popup-content-wrapper, .dark-popup .leaflet-popup-tip {
          background-color: #1e293b !important;
          color: white !important;
        }
      `}} />
    </div>
  );
}
