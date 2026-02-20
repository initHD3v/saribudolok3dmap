'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Search, Layers, Navigation, Info, Menu, ChevronRight } from 'lucide-react';

// Import Map3D secara dinamis agar tidak error pada SSR (Server-Side Rendering)
const Map3D = dynamic(() => import('@/components/map/Map3D'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-slate-950 animate-pulse" />
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* 🌍 Background: 3D Geo Map */}
      <Map3D center={[98.60877, 2.9956]} zoom={14} />

      {/* 🛸 Header Navigation (Glassmorphism) */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 p-2 rounded-lg glow-blue">
            <Navigation className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase tracking-[0.2em] text-blue-500/90 drop-shadow-lg">
              Saribudolok
            </h1>
            <p className="text-[10px] text-blue-400/60 font-mono tracking-widest uppercase">
              3D Geo Experience Platform
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 bg-black/40 backdrop-blur-xl border border-white/5 px-8 py-3 rounded-full pointer-events-auto">
          {['Explore', 'Discover', 'Learn', 'AI'].map((item) => (
            <a key={item} href="#" className="text-xs uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button className="bg-black/40 backdrop-blur-xl border border-white/10 p-2.5 rounded-full hover:bg-white/5 transition-all">
            <Menu className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* 🛰️ Right Sidebar (Region Info - Glassmorphism) */}
      <aside className="absolute top-24 right-6 bottom-24 w-80 z-40 bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col pointer-events-auto transition-all shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest mb-1 block">
            Selected Sector
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Saribu Dolok Village
          </h2>
          <div className="flex gap-2">
            <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded border border-blue-500/20 font-mono">
              Code: 12.08.25.1012
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-white/5 pb-3">
              <span className="text-xs text-slate-500 uppercase tracking-widest">Luas Wilayah</span>
              <span className="text-sm font-mono font-bold text-white tracking-tighter italic">8.25 km²</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-3">
              <span className="text-xs text-slate-500 uppercase tracking-widest">Populasi</span>
              <span className="text-sm font-mono font-bold text-white tracking-tighter italic">~3,200</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-3">
              <span className="text-xs text-slate-500 uppercase tracking-widest">Ketinggian</span>
              <span className="text-sm font-mono font-bold text-white tracking-tighter italic">1,400 m ASL</span>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-xs leading-relaxed text-slate-400 italic">
              "Saribu Dolok merupakan pusat ekonomi di Simalungun Atas, dikelilingi perbukitan subur dan udara pegunungan."
            </p>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg glow-blue group">
            <span className="text-xs uppercase tracking-widest font-bold">Explore Details</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </aside>

      {/* 📡 Bottom Controls (Search/Layers) */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full flex items-center gap-1 shadow-2xl">
            <button className="p-2.5 bg-blue-600 rounded-full text-white glow-blue shadow-lg">
              <Search className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Search location..." 
              className="bg-transparent border-none focus:outline-none text-xs w-48 px-3 text-slate-300 placeholder:text-slate-600 uppercase tracking-widest font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button className="flex items-center gap-2 bg-black/60 backdrop-blur-2xl border border-white/10 px-6 py-3.5 rounded-2xl hover:bg-white/5 transition-all shadow-2xl group">
            <Layers className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Active Layers: 3</span>
          </button>
          
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl flex items-center gap-1 shadow-2xl">
            {['2D', '3D'].map(mode => (
              <button key={mode} className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${mode === '3D' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-slate-500 hover:text-white'}`}>
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🌫️ Atmosphere Gradient (Glow Effect) */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -mr-48 -mt-48 z-0 animate-pulse-slow" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none -ml-48 -mb-48 z-0" />

      <style jsx global>{`
        .glow-blue { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.3); }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
      `}</style>
    </main>
  );
}
