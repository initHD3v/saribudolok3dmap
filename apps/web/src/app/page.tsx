'use client';

import React, { useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, Layers, Navigation, Menu, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Map3DHandle } from '@/components/map/Map3D';
import type { SidebarTabId } from '@/components/sidebar/InfoSidebar';

// Dynamic imports
const Map3D = dynamic(() => import('@/components/map/Map3D'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-slate-950 animate-pulse" />
});
const WelcomeOverlay = dynamic(() => import('@/components/welcome/WelcomeOverlay'), { ssr: false });
const InfoSidebar = dynamic(() => import('@/components/sidebar/InfoSidebar'), { ssr: false });
const MenuDrawer = dynamic(() => import('@/components/menu/MenuDrawer'), { ssr: false });

// Nav items mapped to sidebar tabs
const NAV_ITEMS = [
  { label: 'Explore', tab: 'overview' as SidebarTabId },
  { label: 'Discover', tab: 'tourism' as SidebarTabId },
  { label: 'Learn', tab: 'geography' as SidebarTabId },
  { label: 'Measure', tab: null as SidebarTabId | null },
  { label: 'AI', tab: null as SidebarTabId | null },  // AI panel (placeholder)
] as const;

export default function Home() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [is3D, setIs3D] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<SidebarTabId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFeedback, setSearchFeedback] = React.useState('');
  const [activeNav, setActiveNav] = React.useState('Explore');
  const [isMeasuring, setIsMeasuring] = React.useState(false);
  const mapRef = useRef<Map3DHandle>(null);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeStr = newTheme ? 'dark' : 'light';
    localStorage.setItem('theme', themeStr);
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const toggle3D = useCallback((mode: '2D' | '3D') => {
    const newIs3D = mode === '3D';
    setIs3D(newIs3D);
    mapRef.current?.setPitch(newIs3D ? 65 : 0);
  }, []);

  const handleNavClick = useCallback((label: string, tab: SidebarTabId | null) => {
    if (label === 'Measure') {
      const newState = mapRef.current?.toggleMeasurementMode() || false;
      setIsMeasuring(newState);
      if (newState) {
        setActiveNav('Measure');
      } else {
        setActiveNav('Explore');
      }
      return;
    }

    // If switching away from Measure, ensure measurement mode is off
    if (isMeasuring) {
      mapRef.current?.toggleMeasurementMode();
      setIsMeasuring(false);
    }

    setActiveNav(label);
    if (tab) {
      setActiveTab(tab);
      setSidebarCollapsed(false);
      mapRef.current?.flyToCenter();
    } else {
      // AI placeholder — show feedback
      setSearchFeedback('🤖 AI Spatial Intelligence segera hadir!');
      setTimeout(() => setSearchFeedback(''), 3000);
    }
  }, [isMeasuring]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    // Match regions
    const matches = ['saribudolok', 'saribu dolok', 'saribu', 'dolok'].some(kw => q.includes(kw));
    if (matches) {
      mapRef.current?.flyToCenter();
      setSearchFeedback('✅ Menuju Saribudolok...');
      setActiveTab('overview');
      setSidebarCollapsed(false);
    } else if (['wisata', 'paropo', 'aek nauli', 'simalem', 'tourism'].some(kw => q.includes(kw))) {
      setActiveTab('tourism');
      setSidebarCollapsed(false);
      setSearchFeedback('🏔️ Membuka informasi wisata...');
      mapRef.current?.flyToCenter();
    } else if (['budaya', 'culture', 'kuliner', 'tradisi'].some(kw => q.includes(kw))) {
      setActiveTab('culture');
      setSidebarCollapsed(false);
      setSearchFeedback('🎭 Membuka informasi budaya...');
    } else if (['geografi', 'iklim', 'geography', 'cuaca'].some(kw => q.includes(kw))) {
      setActiveTab('geography');
      setSidebarCollapsed(false);
      setSearchFeedback('🌍 Membuka data geografi...');
    } else {
      setSearchFeedback('❌ Region tidak ditemukan. Coba: Saribudolok, wisata, budaya');
    }
    setSearchQuery('');
    setTimeout(() => setSearchFeedback(''), 3000);
  }, [searchQuery]);

  const handleMenuNavigate = useCallback((tab: SidebarTabId) => {
    setActiveTab(tab);
    setSidebarCollapsed(false);
    mapRef.current?.flyToCenter();
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen overflow-hidden transition-colors duration-700 ease-in-out">

      {/* Welcome Overlay */}
      <WelcomeOverlay onDismiss={() => mapRef.current?.triggerGeolocation()} />

      {/* Menu Drawer */}
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleMenuNavigate} />

      {/* 🌍 Background: 3D Geo Map */}
      <Map3D ref={mapRef} center={[98.6104, 2.9387]} zoom={14} isDark={isDarkMode} is3D={is3D} />

      {/* 🛸 Header Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4 pointer-events-auto"
        >
          <button
            onClick={() => { mapRef.current?.flyToCenter(); setActiveTab('overview'); setSidebarCollapsed(false); }}
            className="glass-panel p-2.5 rounded-2xl glow-effect bg-blue-500/10 hover:scale-105 transition-transform"
          >
            <Navigation className="w-6 h-6 text-blue-500" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-[0.2em] uppercase text-foreground drop-shadow-sm">
              Saribudolok
            </h1>
            <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase opacity-70">
              3D Geo Experience Platform
            </p>
          </div>
        </motion.div>

        {/* Nav Tabs & Menu */}
        <div className="hidden md:flex items-center gap-3 pointer-events-auto">
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-1 glass-panel px-3 py-2 rounded-full shadow-lg"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.label, item.tab)}
                className={`
                  relative px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all
                  ${(activeNav === item.label) || (item.label === 'Measure' && isMeasuring)
                    ? 'text-white bg-blue-600 shadow-lg shadow-blue-600/30'
                    : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </motion.nav>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => setMenuOpen(true)}
            className="glass-panel p-3 rounded-full text-foreground hover:text-blue-500 transition-colors shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="glass-panel p-3 rounded-full text-foreground hover:text-blue-500 transition-all relative overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ y: 20, opacity: 0, rotate: 45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: -45 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      {/* 🛰️ Right Sidebar */}
      <InfoSidebar
        isDarkMode={isDarkMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* 📡 Bottom Controls */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center pointer-events-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col gap-2 pointer-events-auto"
        >
          <form onSubmit={handleSearch} className="glass-panel p-2 rounded-full flex items-center gap-1 shadow-2xl">
            <button type="submit" className="p-3 bg-blue-600 rounded-full text-white glow-effect hover:bg-blue-500 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="JUMP TO REGION..."
              className="bg-transparent border-none focus:outline-none text-[10px] w-48 px-4 text-foreground placeholder:text-foreground/30 font-black tracking-widest uppercase"
            />
          </form>

          {/* Search Feedback */}
          <AnimatePresence>
            {searchFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-panel px-4 py-2.5 rounded-xl text-xs font-bold text-foreground/70 shadow-lg"
              >
                {searchFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 pointer-events-auto"
        >
          <button className="flex items-center gap-3 glass-panel px-6 py-4 rounded-2xl hover:bg-blue-500/10 transition-all shadow-2xl group">
            <Layers className="w-4 h-4 text-blue-500 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Active Layers: 4</span>
          </button>

          <div className="glass-panel p-2 rounded-2xl flex items-center gap-1 shadow-2xl">
            {(['2D', '3D'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => toggle3D(mode)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(mode === '3D' && is3D) || (mode === '2D' && !is3D)
                  ? 'bg-blue-600 text-white glow-effect'
                  : 'text-foreground/40 hover:text-foreground'
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </main>
  );
}
