import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { 
  Filter, Database, X, Check, Menu, Plus, LogOut, User, 
  Globe, Moon, Sun, Mail, MessageCircle, Trash2, Search, Layers, Map as MapIcon
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

const categories = ["Ecology", "Chemistry", "Oceanography", "Meteorology"];

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
  { id: 1, name: "Distribusi Mangrove Karimunjawa", lat: -5.8450, lng: 110.4350, category: "Ecology", status: "Tervalidasi", imageUrl: "https://images.unsplash.com/photo-1542281056-1144fb6b53a4?w=400&q=80", description: "Analisis tutupan lahan dan tingkat dominansi spesies mangrove.", owner: "Tim Riset Ekologi", method: "Citra Satelit" },
  { id: 2, name: "Titik Sampling Pasir Besi", lat: -6.5055, lng: 110.7483, category: "Chemistry", status: "Aktif", imageUrl: "https://images.unsplash.com/photo-1584931423298-c576fda54bd2?w=400&q=80", description: "Lokasi pengambilan material nanokomposit.", owner: "Riset & Pengembangan", method: "Spektrofotometri" },
  { id: 3, name: "Stasiun Pemantauan SST", lat: -6.8147, lng: 110.4150, category: "Meteorology", status: "Live", imageUrl: "https://images.unsplash.com/photo-1620210214811-137b2d19275e?w=400&q=80", description: "Stasiun pengukur Sea Surface Temperature.", owner: "Divisi Operasional", method: "Sensor Pelampung" }
];

const dict = {
  id:
