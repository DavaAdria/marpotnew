import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { 
  Filter, Database, X, Check, Menu, Plus, LogOut, User, 
  Globe, Moon, Sun, Mail, MessageCircle, Trash2, Search, Layers, Send, Map as MapIcon, CheckSquare, Upload
} from 'lucide-react'; 
import { Instagram } from 'lucide-brands';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper Fungsi Ekstraksi Direct Image Link Google Drive
const formatImageUrl = (url) => {
  if (!url || typeof url !== 'string') return 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=80';
  const trimmed = url.trim();
  if (trimmed.includes('drive.google.com') || trimmed.includes('googleusercontent.com')) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return trimmed || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=80';
};

function MapResizer({ isSidebarOpen }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map, isSidebarOpen]);
  return null;
}

const categories = [
  "Tide", 
  "Sediment", 
  "Ocean Waves", 
  "Marine Pollution",
  "Fishery", 
  "Ecology And Biota", 
  "Chemistry",
  "Climatology And Meteorology Atmosphere", 
  "Disaster Mitigation", 
  "Ocean Current"
];

const dataTypes = ["Data Mentah", "Data Olahan", "Peta", "Jurnal"];

const BASEMAPS = {
  satellite: {
    name: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

const initialData = [
  { id: 1, name: "Distribusi Mangrove Karimunjawa", lat: -5.8450, lng: 110.4350, category: "Ecology And Biota", status: "Tervalidasi", imageUrl: "https://images.unsplash.com/photo-1542281056-1144fb6b53a4?w=400&q=80", description: "Analisis tutupan lahan dan tingkat dominansi spesies mangrove.", owner: "Tim Riset Ekologi", method: "Citra Satelit", availableDataTypes: ["Data Mentah", "Peta", "Jurnal"] },
  { id: 2, name: "Titik Sampling Pasir Besi", lat: -6.5055, lng: 110.7483, category: "Chemistry", status: "Aktif", imageUrl: "https://images.unsplash.com/photo-1584931423298-c576fda54bd2?w=400&q=80", description: "Lokasi pengambilan material nanokomposit.", owner: "Riset & Pengembangan", method: "Spektrofotometri", availableDataTypes: ["Data Mentah", "Data Olahan"] },
  { id: 3, name: "Stasiun Pemantauan SST", lat: -6.8147, lng: 110.4150, category: "Climatology And Meteorology Atmosphere", status: "Live", imageUrl: "https://images.unsplash.com/photo-1620210214811-137b2d19275e?w=400&q=80", description: "Stasiun pengukur Sea Surface Temperature.", owner: "Divisi Operasional", method: "Sensor Pelampung", availableDataTypes: ["Data Olahan", "Peta"] }
];

const dict = {
  id: {
    title: "Register Geoportal (Re-Port)", dashboard: "Dasbor", stations: "Peta Interaktif",
    adminLogin: "Login Admin", logout: "Keluar", addData: "Tambah Data Peta",
    aboutTitle: "Tentang Register Geoportal (Re-Port)", aboutSub: "Portal Data Informasi Geospasial Kelautan",
    aboutDesc: "Register Geoportal (Re-port) merupakan sebuah portal yang memuat data mengenai informasi geospasial kelautan yang dirancang oleh Register Undip sebagai bahan pembelajaran dan edukasi mahasiswa mengenai penginderaan jauh dan sistem informasi geografi dalam lingkup kelautan. Geoportal ini mengatur dan menyediakan layanan, pencarian, dan akses untuk informasi geospasial kelautan.",
    contactUs: "Hubungi Kami",
    filterTitle: "Filter Data Peta", showing: "Menampilkan", activeSpots: "titik data aktif",
    mapCategory: "Kategori Pemetaan", fullMeta: "Lihat Metadata Penuh",
    modalAddTitle: "Input Data Peta Baru", saveBtn: "Simpan & Tampilkan Peta",
    nameLabel: "Nama Data / Proyek Peta", lat: "Latitude", lng: "Longitude",
    category: "Kategori", owner: "Pengelola Data", desc: "Deskripsi Peta", photo: "Link Foto/Lampiran Peta (URL GDrive)",
    availableData: "Jenis Data Tersedia", reqDataTypes: "Pilih Jenis Data yang Diminta",
    loginSuccess: "Login Berhasil! Mode Administrator Diaktifkan.",
    loginFail: "Akses Ditolak: Username atau Password salah!",
    saveSuccess: "Berhasil! Data peta tersimpan dengan aman.",
    deleteBtn: "Hapus Data Peta",
    deleteConfirm: "Apakah Anda yakin ingin menghapus data peta ini?",
    deleteSuccess: "Data peta berhasil dihapus.",
    searchPlaceholder: "Cari nama data, lokasi, atau pengelola...",
    basemapTitle: "Mode Peta", satellitelayer: "Satelit Esri", osmlayer: "OpenStreetMap",
    requestDataBtn: "Minta Akses Data Ini", requestModalTitle: "Form Permintaan Akses Data Geospasial",
    reqName: "Nama Lengkap", reqInst: "Instansi / Universitas / Organisasi", reqEmail: "Email Resmi",
    reqPurpose: "Tujuan Penggunaan Data", reqDataSelect: "Judul Data Peta yang Diminta",
    sendReqWhatsapp: "Kirim via WhatsApp", sendReqEmail: "Kirim via Email",
    // Teks Baru Untuk Upload Data
    uploadDataBtn: "Upload Data", uploadModalTitle: "Form Pengajuan Upload Data",
    uploadDataName: "Judul Data yang Diupload", uploadLink: "Link File / GDrive Data Anda",
    uploadDesc: "Deskripsi Singkat / Abstrak"
  },
  en: {
    title: "Register Geoportal (Re-Port)", dashboard: "Dashboard", stations: "Interactive Map",
    adminLogin: "Admin Login", logout: "Logout", addData: "Add Map Data",
    aboutTitle: "About Register Geoportal (Re-Port)", aboutSub: "Marine Geospatial Information Data Portal",
    aboutDesc: "Register Geoportal (Re-port) is a portal containing data on marine geospatial information designed by Register Undip as learning and educational material for students regarding remote sensing and geographic information systems within the marine scope.",
    contactUs: "Contact Us",
    filterTitle: "Map Data Filter", showing: "Showing", activeSpots: "active data points",
    mapCategory: "Mapping Category", fullMeta: "View Full Metadata",
    modalAddTitle: "Input New Map Data", saveBtn: "Save & Display Map",
    nameLabel: "Map Data / Project Name", lat: "Latitude", lng: "Longitude",
    category: "Category", owner: "Data Manager", desc: "Map Description", photo: "Photo/Attachment Link (GDrive URL)",
    availableData: "Available Data Types", reqDataTypes: "Requested Data Types",
    loginSuccess: "Login Successful! Administrator Mode Activated.",
    loginFail: "Access Denied: Incorrect Username or Password!",
    saveSuccess: "Success! Map data safely stored.",
    deleteBtn: "Delete Map Data",
    deleteConfirm: "Are you sure you want to delete this map data?",
    deleteSuccess: "Map data deleted successfully.",
    searchPlaceholder: "Search data name, location, or manager...",
    basemapTitle: "Map Mode", satellitelayer: "Esri Satellite", osmlayer: "OpenStreetMap",
    requestDataBtn: "Request Access to Data", requestModalTitle: "Geospatial Data Access Request Form",
    reqName: "Full Name", reqInst: "Institution / University / Organization", reqEmail: "Official Email",
    reqPurpose: "Purpose of Data Request", reqDataSelect: "Requested Map Dataset Title",
    sendReqWhatsapp: "Send via WhatsApp", sendReqEmail: "Send via Email",
    uploadDataBtn: "Upload Data", uploadModalTitle: "Data Upload Request Form",
    uploadDataName: "Uploaded Data Title", uploadLink: "Your File / GDrive Link",
    uploadDesc: "Short Description / Abstract"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('id');
  const t = dict[lang];

  const [activeFilters, setActiveFilters] = useState(categories);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBasemap, setCurrentBasemap] = useState('satellite');
  
  const [modalData, setModalData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stations, setStations] = useState([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', lat: '', lng: '', category: 'Ocean Current', owner: '', description: '', method: 'Sensor Lapangan', status: 'Aktif', imageUrl: '', availableDataTypes: []
  });

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMapData, setRequestMapData] = useState(null);
  const [requestForm, setRequestForm] = useState({
    name: '', inst: '', email: '', purpose: '', selectedData: '', requestedTypes: []
  });

  // STATE UNTUK FORM PENGAJUAN UPLOAD DATA OLEH USER
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '', inst: '', email: '', title: '', category: 'Ocean Current', types: [], link: '', description: ''
  });

  // PENYIMPANAN DATA
  useEffect(() => {
    const savedData = localStorage.getItem('marineGeoportalData');
    const localStations = savedData ? JSON.parse(savedData) : null;

    fetch('https://report-backend.vercel.app/api/stations')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setStations(data);
          localStorage.setItem('marineGeoportalData', JSON.stringify(data));
        } else if (localStations && localStations.length > 0) {
          setStations(localStations);
        } else {
          setStations(initialData);
          localStorage.setItem('marineGeoportalData', JSON.stringify(initialData));
        }
      })
      .catch(() => {
        if (localStations && localStations.length > 0) {
          setStations(localStations);
        } else {
          setStations(initialData);
          localStorage.setItem('marineGeoportalData', JSON.stringify(initialData));
        }
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

  const filteredData = stations.filter(d => {
    const matchCat = activeFilters.includes(d.category);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = q === '' || 
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.owner && d.owner.toLowerCase().includes(q)) ||
      (d.category && d.category.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q));
    
    return matchCat && matchSearch;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (type) => {
    setFormData(prev => {
      if (prev.availableDataTypes.includes(type)) {
        return { ...prev, availableDataTypes: prev.availableDataTypes.filter(t => t !== type) };
      }
      return { ...prev, availableDataTypes: [...prev.availableDataTypes, type] };
    });
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
    const processedImageUrl = formatImageUrl(formData.imageUrl);

    const newStation = { 
      id: Date.now(), 
      ...formData, 
      lat: parseFloat(formData.lat), 
      lng: parseFloat(formData.lng), 
      imageUrl: processedImageUrl 
    };

    const updatedStations = [...stations, newStation];
    setStations(updatedStations);
    localStorage.setItem('marineGeoportalData', JSON.stringify(updatedStations));

    try {
      await fetch('https://report-backend.vercel.app/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStation)
      });
    } catch (err) {
      console.log('Tersimpan lokal di browser.', err);
    }

    setIsAddModalOpen(false);
    setFormData({ name: '', lat: '', lng: '', category: 'Ocean Current', owner: '', description: '', method: 'Sensor Lapangan', status: 'Aktif', imageUrl: '', availableDataTypes: [] });
    setActiveTab('stations');
    alert(t.saveSuccess);
  };

  const handleDeleteStation = async (targetId) => {
    if (!window.confirm(t.deleteConfirm)) return;

    const updatedStations = stations.filter(s => s.id !== targetId && s._id !== targetId);
    setStations(updatedStations);
    localStorage.setItem('marineGeoportalData', JSON.stringify(updatedStations));

    if (modalData && (modalData.id === targetId || modalData._id === targetId)) {
      setModalData(null);
    }

    try {
      await fetch(`https://report-backend.vercel.app/api/stations/${targetId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.log('Terhapus dari browser.', err);
    }

    alert(t.deleteSuccess);
  };

  const openRequestModal = (mapObj) => {
    setRequestForm(prev => ({ ...prev, selectedData: mapObj.name, requestedTypes: [] }));
    setRequestMapData(mapObj);
    setIsRequestModalOpen(true);
    setModalData(null); 
  };

  const handleSendRequestWhatsApp = (e) => {
    e.preventDefault();
    const rawText = `Halo Admin Register Undip, saya ingin mengajukan permintaan akses data geospasial kelautan:\n\n` +
      `*Nama:* ${requestForm.name}\n` +
      `*Instansi:* ${requestForm.inst}\n` +
      `*Email:* ${requestForm.email}\n` +
      `*Data Peta:* ${requestForm.selectedData}\n` +
      `*Jenis Data:* ${requestForm.requestedTypes.length > 0 ? requestForm.requestedTypes.join(', ') : '-'}\n` +
      `*Tujuan Penggunaan:* ${requestForm.purpose}`;
    
    const text = encodeURIComponent(rawText);
    const waUrl = `https://wa.me/6283865131284?text=${text}`;
    
    const newWindow = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = waUrl;
    }
    setIsRequestModalOpen(false);
  };

  const handleSendRequestEmail = () => {
    const subject = encodeURIComponent(`[Permintaan Akses Data] - ${requestForm.selectedData}`);
    const body = encodeURIComponent(
      `Yth. Tim Register Undip,\n\nSaya bermaksud mengajukan permintaan akses data geospasial dengan rincian:\n\n` +
      `Nama: ${requestForm.name}\n` +
      `Instansi: ${requestForm.inst}\n` +
      `Email: ${requestForm.email}\n` +
      `Data Peta: ${requestForm.selectedData}\n` +
      `Jenis Data: ${requestForm.requestedTypes.length > 0 ? requestForm.requestedTypes.join(', ') : '-'}\n` +
      `Tujuan Penggunaan: ${requestForm.purpose}\n\nTerima kasih.`
    );
    window.location.href = `mailto:registerundip@gmail.com?subject=${subject}&body=${body}`;
    setIsRequestModalOpen(false);
  };

  // FUNGSI UNTUK PENGAJUAN UPLOAD DATA
  const handleSendUploadWhatsApp = (e) => {
    e.preventDefault();
    const rawText = `Halo Admin Register Undip, saya ingin mengajukan publikasi/upload data ke Register Geoportal:\n\n` +
      `*Nama:* ${uploadForm.name}\n` +
      `*Instansi:* ${uploadForm.inst}\n` +
      `*Email:* ${uploadForm.email}\n` +
      `*Judul Data:* ${uploadForm.title}\n` +
      `*Kategori:* ${uploadForm.category}\n` +
      `*Jenis Data:* ${uploadForm.types.length > 0 ? uploadForm.types.join(', ') : '-'}\n` +
      `*Link File / GDrive:* ${uploadForm.link}\n` +
      `*Deskripsi Singkat:* ${uploadForm.description}`;
    
    const text = encodeURIComponent(rawText);
    const waUrl = `https://wa.me/6283865131284?text=${text}`;
    
    const newWindow = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = waUrl;
    }
    setIsUploadModalOpen(false);
  };

  const handleSendUploadEmail = () => {
    const subject = encodeURIComponent(`[Pengajuan Upload Data] - ${uploadForm.title}`);
    const body = encodeURIComponent(
      `Yth. Tim Register Undip,\n\nSaya bermaksud mengajukan upload/publikasi data geospasial dengan rincian:\n\n` +
      `Nama: ${uploadForm.name}\n` +
      `Instansi: ${uploadForm.inst}\n` +
      `Email: ${uploadForm.email}\n` +
      `Judul Data: ${uploadForm.title}\n` +
      `Kategori: ${uploadForm.category}\n` +
      `Jenis Data: ${uploadForm.types.length > 0 ? uploadForm.types.join(', ') : '-'}\n` +
      `Link File / GDrive: ${uploadForm.link}\n` +
      `Deskripsi Singkat: ${uploadForm.description}\n\nMohon direview dan dipublikasikan. Terima kasih.`
    );
    window.location.href = `mailto:registerundip@gmail.com?subject=${subject}&body=${body}`;
    setIsUploadModalOpen(false);
  };

  const theme = {
    bgApp: isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100',
    textMain: isDark ? 'text-slate-100' : 'text-slate-800',
    bgNav: isDark ? 'bg-slate-950/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200/80 backdrop-blur-md',
    bgCard: isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200 backdrop-blur-md' : 'bg-white/90 border-slate-200/80 text-slate-700 shadow-lg shadow-blue-500/5 backdrop-blur-md',
    bgSidebar: isDark ? 'bg-slate-900/95 border-slate-800 backdrop-blur-md' : 'bg-white/95 border-slate-200/80 backdrop-blur-md shadow-2xl',
    bgFilterItem: isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200/80 hover:bg-blue-50/50',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${theme.bgApp} ${theme.textMain}`}>
      
      {/* HEADER */}
      <header className={`${theme.bgNav} border-b px-3 sm:px-6 py-2.5 sm:py-4 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center z-[1000] shadow-sm w-full shrink-0`}>
        <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="Register Undip Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-sm" />
            <h1 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 bg-clip-text text-transparent truncate max-w-[160px] xs:max-w-[200px] sm:max-w-none">
              {t.title}
            </h1>
          </div>

          <div className="flex bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold justify-center gap-1 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 sm:px-6 py-1.5 rounded-lg transition text-center ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : theme.textMuted}`}
            >
              {t.dashboard}
            </button>
            <button 
              onClick={() => setActiveTab('stations')}
              className={`px-4 sm:px-6 py-1.5 rounded-lg transition text-center ${activeTab === 'stations' ? 'bg-blue-600 text-white shadow-md' : theme.textMuted}`}
            >
              {t.stations}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end w-full md:w-auto gap-1.5 sm:gap-3 text-xs sm:text-sm mt-2 sm:mt-0">
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-bold text-xs sm:text-sm ${theme.bgCard} hover:border-blue-500 transition`}>
            <Globe size={13} className="sm:w-4 sm:h-4 text-blue-500" /> {lang.toUpperCase()}
          </button>
          <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-xl border ${theme.bgCard} hover:text-blue-500 transition`}>
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <div className="flex flex-1 overflow-hidden relative w-full h-full">
        
        {/* TAB 1: DASBOR */}
        {activeTab === 'dashboard' && (
          <div className="relative flex-1 w-full h-full overflow-y-auto">
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-25 pointer-events-none filter saturate-150">
              <MapContainer center={[-2.5, 118.0]} zoom={5} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} className="w-full h-full">
                <TileLayer attribution='&copy; Esri' url={BASEMAPS.satellite.url} />
              </MapContainer>
            </div>

            <div className="relative z-10 p-4 sm:p-8 md:p-12 flex flex-col items-center min-h-full">
              <div className="max-w-4xl w-full text-center mb-8 sm:mb-12">
                <div className="inline-flex items-center justify-center mb-4 sm:mb-6 p-3 bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-xl border border-white dark:border-slate-700 backdrop-blur-md">
                   <img src="/logo.png" alt="Register Undip Logo Large" className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-md" />
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 tracking-tight bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 bg-clip-text text-transparent">{t.aboutTitle}</h1>
                <p className={`text-sm sm:text-xl font-medium ${theme.textMuted}`}>{t.aboutSub}</p>
                
                <div className={`mt-6 sm:mt-10 p-5 sm:p-8 rounded-3xl ${theme.bgCard} shadow-2xl border text-center sm:text-left leading-relaxed text-xs sm:text-base md:text-lg max-w-full overflow-hidden`}>
                  <p className="break-words">{t.aboutDesc}</p>
                </div>
              </div>

              {/* SEKSI KONTAK */}
              <div className="max-w-4xl w-full mb-12">
                <h2 className="text-lg sm:text-2xl font-bold mb-6 text-center">{t.contactUs}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
                  <a href="mailto:registerundip@gmail.com" className={`p-5 sm:p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all hover:border-blue-500 ${theme.bgCard}`}>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3.5 sm:p-4 rounded-2xl text-blue-600">
                      <Mail size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">Email</h3>
                      <p className={`text-xs sm:text-sm mt-1 break-all ${theme.textMuted}`}>registerundip@gmail.com</p>
                    </div>
                  </a>

                  <a href="https://instagram.com/register_undip" target="_blank" rel="noreferrer" className={`p-5 sm:p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all hover:border-pink-500 ${theme.bgCard}`}>
                    <div className="bg-pink-100 dark:bg-pink-900/50 p-3.5 sm:p-4 rounded-2xl text-pink-600">
                      <Instagram size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">Instagram</h3>
                      <p className={`text-xs sm:text-sm mt-1 ${theme.textMuted}`}>@register_undip</p>
                    </div>
                  </a>

                  <a href="https://wa.me/6283865131284" target="_blank" rel="noreferrer" className={`p-5 sm:p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all hover:border-green-500 ${theme.bgCard}`}>
                    <div className="bg-green-100 dark:bg-green-900/50 p-3.5 sm:p-4 rounded-2xl text-green-600">
                      <MessageCircle size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">WhatsApp</h3>
                      <p className={`text-xs sm:text-sm mt-1 ${theme.textMuted}`}>083865131284 (Dava)</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PETA INTERAKTIF */}
        {activeTab === 'stations' && (
          <div className="relative w-full h-full overflow-hidden">
            
            {isSidebarOpen && (
              <div 
                onClick={() => setIsSidebarOpen(false)} 
                className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[1999]"
              />
            )}

            {/* SIDEBAR DENGAN SEARCH BAR & FILTER */}
            <aside className={`absolute top-0 bottom-0 left-0 z-[1000] w-72 sm:w-80 flex flex-col shadow-2xl shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${theme.bgSidebar}`}>
              <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-blue-500" />
                  <h2 className="font-bold text-base sm:text-lg">{t.filterTitle}</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"><X size={18}/></button>
              </div>
              
              <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
                <div>
                  <div className="relative flex items-center">
                    <Search size={16} className="absolute left-3 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className={`w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-blue-500 transition ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme.textMuted}`}>{t.mapCategory}</p>
                  <div className="flex flex-col gap-2">
                    {categories.map(cat => {
                      const isActive = activeFilters.includes(cat);
                      return (
                        <button key={cat} onClick={() => toggleFilter(cat)} className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border-2 transition-all ${isActive ? 'bg-blue-500/10 border-blue-500' : theme.bgFilterItem}`}>
                          <span className={`text-[11px] sm:text-[13px] font-semibold text-left leading-tight pr-2 ${isActive ? 'text-blue-500' : theme.textMuted}`}>{cat}</span>
                          <div className={`w-5 h-5 shrink-0 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-blue-500' : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`}>
                            {isActive && <Check size={12} strokeWidth={3} className="text-white" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className={`p-4 sm:p-5 border-t ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
                <div className="flex flex-col gap-3">
                  <div className={`flex items-center justify-center gap-2 text-xs sm:text-sm font-medium py-2.5 px-3 rounded-xl border shadow-sm ${theme.bgCard}`}>
                    <Database size={15} className="text-blue-500" />
                    <span>{t.showing} <strong>{filteredData.length}</strong> {t.activeSpots}</span>
                  </div>
                  
                  {isAdmin ? (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setIsAddModalOpen(true)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm shadow-md">
                        <Plus size={16} /> {t.addData}
                      </button>
                      <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/40 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm">
                        <LogOut size={16} /> {t.logout}
                      </button>
                    </div>
                  ) : (
                    // TAMPILAN JIKA BUKAN ADMIN (USER BIASA)
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setIsUploadModalOpen(true)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md text-sm">
                        <Upload size={16} /> {t.uploadDataBtn}
                      </button>
                      <button onClick={() => setIsLoginModalOpen(true)} className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm text-sm border ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-100'}`}>
                        <User size={16} /> {t.adminLogin}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* AREA PETA */}
            <div className="w-full h-full relative z-0">
              
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-[999] p-2.5 rounded-2xl shadow-xl border focus:outline-none transition-all ${theme.bgCard} hover:text-blue-500 active:scale-95`}
                aria-label="Toggle Menu"
              >
                <Menu size={20} className="sm:w-6 sm:h-6" />
              </button>

              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[999] flex items-center gap-1 p-1 rounded-2xl shadow-xl border backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setCurrentBasemap('satellite')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${currentBasemap === 'satellite' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <MapIcon size={14} /> {t.satellitelayer}
                </button>
                <button 
                  onClick={() => setCurrentBasemap('osm')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${currentBasemap === 'osm' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <Layers size={14} /> {t.osmlayer}
                </button>
              </div>

              <MapContainer 
                center={[-2.5, 118.0]} 
                zoom={5} 
                zoomControl={false} 
                className="w-full h-full z-0"
                style={{ width: '100%', height: '100%' }}
              >
                <MapResizer isSidebarOpen={isSidebarOpen} />
                <ZoomControl position="bottomright" />
                
                <TileLayer 
                  key={currentBasemap}
                  attribution={BASEMAPS[currentBasemap].attribution} 
                  url={BASEMAPS[currentBasemap].url} 
                />
                
                {filteredData.map(data => (
                  <Marker key={data.id || data._id} position={[data.lat, data.lng]}>
                    <Popup className={`rounded-2xl p-0 overflow-hidden ${isDark ? 'dark-popup' : ''}`}>
                      <div className={`w-56 sm:w-64 ${isDark ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                        <div className="mb-2 sm:mb-3 relative">
                          <img 
                            src={formatImageUrl(data.imageUrl)} 
                            alt={data.name} 
                            className="w-full h-28 sm:h-36 object-cover rounded-t-xl"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=80";
                            }}
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-blue-700 text-[8px] sm:text-[9px] font-extrabold uppercase rounded-md shadow-sm max-w-[85%] truncate leading-tight">{data.category}</span>
                        </div>
                        <div className="px-3 pb-3 flex flex-col gap-2">
                          <h4 className="font-bold text-xs sm:text-[14px] leading-snug">{data.name}</h4>
                          <button onClick={() => setModalData(data)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-md">{t.fullMeta}</button>
                          
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteStation(data.id || data._id)} 
                              className="w-full bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-500/30 text-xs font-bold py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Trash2 size={13} /> {t.deleteBtn}
                            </button>
                          )}
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

      {/* MODAL PERMINTAAN DATA */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[4000] flex items-center justify-center p-4">
          <div className={`${theme.bgCard} rounded-3xl w-full max-w-lg shadow-2xl p-6 border ${isDark ? 'border-slate-800' : 'border-white'} max-h-[95vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2"><Send size={18} className="text-blue-500"/> {t.requestModalTitle}</h2>
              <button onClick={() => setIsRequestModalOpen(false)} className="p-1 rounded-full hover:bg-red-500 hover:text-white transition"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSendRequestWhatsApp} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1 opacity-80">{t.reqName}</label>
                <input required type="text" value={requestForm.name} onChange={(e) => setRequestForm({...requestForm, name: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Nama Lengkap" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-80">{t.reqInst}</label>
                  <input required type="text" value={requestForm.inst} onChange={(e) => setRequestForm({...requestForm, inst: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Univ / Instansi" />
                </div>
                <div>
                  <label className="block font-bold mb-1 opacity-80">{t.reqEmail}</label>
                  <input required type="email" value={requestForm.email} onChange={(e) => setRequestForm({...requestForm, email: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="email@domain.com" />
                </div>
              </div>
              
              <div className="opacity-60 pointer-events-none">
                <label className="block font-bold mb-1">{t.reqDataSelect}</label>
                <input readOnly type="text" value={requestForm.selectedData} className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`} />
              </div>

              <div>
                <label className="block font-bold mb-2 opacity-80">{t.reqDataTypes}</label>
                <div className="grid grid-cols-2 gap-2">
                  {((requestMapData && requestMapData.availableDataTypes && requestMapData.availableDataTypes.length > 0) ? requestMapData.availableDataTypes : dataTypes).map(type => (
                    <label key={type} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${requestForm.requestedTypes.includes(type) ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : (isDark ? 'bg-slate-900 border-slate-700 hover:border-slate-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300')}`}>
                      <input 
                        type="checkbox" 
                        checked={requestForm.requestedTypes.includes(type)}
                        onChange={() => {
                          setRequestForm(prev => ({
                            ...prev,
                            requestedTypes: prev.requestedTypes.includes(type)
                              ? prev.requestedTypes.filter(t => t !== type)
                              : [...prev.requestedTypes, type]
                          }))
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="font-medium text-xs">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">{t.reqPurpose}</label>
                <textarea required value={requestForm.purpose} onChange={(e) => setRequestForm({...requestForm, purpose: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 h-16 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Tujuan skripsi, riset, dll..." />
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md">
                  <MessageCircle size={16} /> {t.sendReqWhatsapp}
                </button>
                <button type="button" onClick={handleSendRequestEmail} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md">
                  <Mail size={16} /> {t.sendReqEmail}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGAJUAN UPLOAD DATA (UNTUK USER) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[4000] flex items-center justify-center p-4">
          <div className={`${theme.bgCard} rounded-3xl w-full max-w-lg shadow-2xl p-6 border ${isDark ? 'border-slate-800' : 'border-white'} max-h-[95vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2"><Upload size={18} className="text-emerald-500"/> {t.uploadModalTitle}</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 rounded-full hover:bg-red-500 hover:text-white transition"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSendUploadWhatsApp} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1 opacity-80">{t.reqName}</label>
                <input required type="text" value={uploadForm.name} onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Nama Anda" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-80">{t.reqInst}</label>
                  <input required type="text" value={uploadForm.inst} onChange={(e) => setUploadForm({...uploadForm, inst: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Instansi / Univ" />
                </div>
                <div>
                  <label className="block font-bold mb-1 opacity-80">{t.reqEmail}</label>
                  <input required type="email" value={uploadForm.email} onChange={(e) => setUploadForm({...uploadForm, email: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="email@domain.com" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-80">{t.uploadDataName}</label>
                  <input required type="text" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Judul Peta / Data" />
                </div>
                <div>
                  <label className="block font-bold mb-1 opacity-80">{t.category}</label>
                  <select value={uploadForm.category} onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2 opacity-80">{t.availableData}</label>
                <div className="grid grid-cols-2 gap-2">
                  {dataTypes.map(type => (
                    <label key={type} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${uploadForm.types.includes(type) ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-300' : (isDark ? 'bg-slate-900 border-slate-700 hover:border-slate-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300')}`}>
                      <input 
                        type="checkbox" 
                        checked={uploadForm.types.includes(type)}
                        onChange={() => {
                          setUploadForm(prev => ({
                            ...prev,
                            types: prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type]
                          }))
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="font-medium text-xs">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">{t.uploadLink}</label>
                <input required type="url" value={uploadForm.link} onChange={(e) => setUploadForm({...uploadForm, link: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="https://drive.google.com/..." />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">{t.uploadDesc}</label>
                <textarea required value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 h-16 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Penjelasan singkat mengenai data..." />
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md">
                  <MessageCircle size={16} /> {t.sendReqWhatsapp}
                </button>
                <button type="button" onClick={handleSendUploadEmail} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md">
                  <Mail size={16} /> {t.sendReqEmail}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
          <div className={`${theme.bgCard} rounded-3xl w-full max-w-sm shadow-2xl p-6 border ${isDark ? 'border-slate-800' : 'border-white'}`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-lg flex items-center gap-2"><User size={20} className="text-cyan-500"/> {t.adminLogin}</h2>
              <button onClick={() => setIsLoginModalOpen(false)} className={`p-1 rounded-full hover:bg-red-500 hover:text-white transition`}><X size={18} /></button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">Username</label>
                <input required type="text" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className={`w-full p-3 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="admin" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">Password</label>
                <input required type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className={`w-full p-3 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl mt-2 shadow-lg transition text-sm">Login</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH DATA PETA (ADMIN) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[3000] flex items-center justify-center p-3 sm:p-4">
          <div className={`${theme.bgCard} rounded-3xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto border ${isDark ? 'border-slate-800' : 'border-white'}`}>
            <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className="font-bold text-lg flex items-center gap-2"><Plus size={22} className="text-cyan-500"/> {t.modalAddTitle}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full hover:bg-red-500 hover:text-white transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddStation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">{t.nameLabel}</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold mb-1 opacity-70">{t.lat}</label><input required type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} /></div>
                <div><label className="block text-xs font-bold mb-1 opacity-70">{t.lng}</label><input required type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-70">{t.category}</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold mb-1 opacity-70">{t.owner}</label><input required type="text" name="owner" value={formData.owner} onChange={handleInputChange} className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} /></div>
              </div>
              
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">{t.availableData}</label>
                <div className="grid grid-cols-2 gap-2">
                  {dataTypes.map(type => (
                    <label key={type} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.availableDataTypes.includes(type)}
                        onChange={() => handleCheckboxChange(type)}
                        className="rounded border-slate-300 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div><label className="block text-xs font-bold mb-1 text-cyan-500">{t.photo}</label><input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="https://drive.google.com/file/d/..." /></div>
              <div><label className="block text-xs font-bold mb-1 opacity-70">{t.desc}</label><textarea required name="description" value={formData.description} onChange={handleInputChange} className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:border-cyan-500 h-14 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} /></div>
              <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl mt-3 shadow-lg transition text-sm">{t.saveBtn}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL METADATA */}
      {modalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[4000] flex items-center justify-center p-4">
          <div className={`${theme.bgCard} rounded-3xl w-full max-w-lg shadow-2xl p-6 border ${isDark ? 'border-slate-800' : 'border-white'}`}>
            <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2"><Database size={18} className="text-blue-500"/> Metadata Peta</h2>
              <button onClick={() => setModalData(null)} className="p-1 rounded-full hover:bg-red-500 hover:text-white transition"><X size={18} /></button>
            </div>
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="mb-3">
                <img 
                  src={formatImageUrl(modalData.imageUrl)} 
                  alt={modalData.name} 
                  className="w-full h-48 object-cover rounded-2xl shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=80";
                  }}
                />
              </div>
              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}><span className="opacity-70">Nama Data</span><span className="col-span-2 font-bold">{modalData.name}</span></div>
              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}><span className="opacity-70">Kategori</span><span className="col-span-2"><span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-md text-xs font-bold">{modalData.category}</span></span></div>
              
              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className="opacity-70">Data Tersedia</span>
                <span className="col-span-2">
                  {(modalData.availableDataTypes && modalData.availableDataTypes.length > 0) ? (
                    <div className="flex flex-wrap gap-1.5">
                      {modalData.availableDataTypes.map(type => (
                        <span key={type} className="inline-flex items-center gap-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <CheckSquare size={10} /> {type}
                        </span>
                      ))}
                    </div>
                  ) : <span className="opacity-50 italic">-</span>}
                </span>
              </div>

              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}><span className="opacity-70">Koordinat</span><span className="col-span-2 font-mono text-xs">{modalData.lat}, {modalData.lng}</span></div>
              <div className={`grid grid-cols-3 border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}><span className="opacity-70">Pengelola</span><span className="col-span-2">{modalData.owner}</span></div>
              <div className="grid grid-cols-3"><span className="opacity-70">Deskripsi</span><span className="col-span-2 leading-relaxed">{modalData.description}</span></div>
              
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <button 
                  onClick={() => openRequestModal(modalData)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Send size={15} /> {t.requestDataBtn}
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => handleDeleteStation(modalData.id || modalData._id)} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Trash2 size={15} /> {t.deleteBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .dark-popup .leaflet-popup-content-wrapper, .dark-popup .leaflet-popup-tip {
          background-color: #0f172a !important;
          color: white !important;
        }
      `}} />
    </div>
  );
}
