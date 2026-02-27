'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import saribudolokData from '@/data/saribudolokData';

export default function WelcomeOverlay({ onDismiss }: { onDismiss?: () => void }) {
    const [visible, setVisible] = useState(() => {
        if (typeof window !== 'undefined') {
            return !sessionStorage.getItem('welcome-seen');
        }
        return false;
    });
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        // Hydration check
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('welcome-seen', 'true');
        setVisible(false);
        if (onDismiss) onDismiss();
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={saribudolokData.heroImage}
                            alt="Saribudolok"
                            fill
                            className="object-cover"
                            priority
                            onLoad={() => setImageLoaded(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                    </div>

                    {/* Animated Grid Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `
                  linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
                `,
                                backgroundSize: '60px 60px',
                            }}
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center px-6 max-w-2xl">
                        {/* Compass Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={imageLoaded ? { scale: 1, rotate: 0 } : {}}
                            transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                            className="inline-flex p-4 rounded-full bg-blue-500/20 border border-blue-500/30 mb-8 backdrop-blur-sm"
                        >
                            <Navigation className="w-8 h-8 text-blue-400" />
                        </motion.div>

                        {/* Location Badge */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={imageLoaded ? { y: 0, opacity: 1 } : {}}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="flex items-center justify-center gap-2 mb-4"
                        >
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em]">
                                {saribudolokData.kabupaten}, {saribudolokData.provinsi}
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={imageLoaded ? { y: 0, opacity: 1 } : {}}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 leading-[0.95]"
                        >
                            Selamat Datang di
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                Saribudolok
                            </span>
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={imageLoaded ? { y: 0, opacity: 1 } : {}}
                            transition={{ delay: 1.0, duration: 0.6 }}
                            className="text-sm md:text-base text-white/60 leading-relaxed mb-6 max-w-lg mx-auto"
                        >
                            {saribudolokData.welcomeText}
                        </motion.p>

                        {/* GPS Permission Notice */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={imageLoaded ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="inline-flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 mb-8 max-w-sm"
                        >
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                                <Navigation className="w-4 h-4" />
                                <span>Izin Lokasi (GPS)</span>
                            </div>
                            <p className="text-[11px] text-white/40 leading-tight">
                                Berikan akses lokasi agar platform dapat mendeteksi posisi Anda secara real-time pada peta Saribudolok.
                            </p>
                        </motion.div>

                        {/* CTA Button */}
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={imageLoaded ? { y: 0, opacity: 1 } : {}}
                            transition={{ delay: 1.3, duration: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDismiss}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all shadow-2xl shadow-blue-600/30"
                        >
                            <span>Jelajahi Sekarang</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        {/* Stats Row */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={imageLoaded ? { y: 0, opacity: 1 } : {}}
                            transition={{ delay: 1.6, duration: 0.6 }}
                            className="flex items-center justify-center gap-8 mt-12"
                        >
                            {[
                                { label: 'Luas', value: `${saribudolokData.areaKm2} km²` },
                                { label: 'Elevasi', value: `${saribudolokData.elevation.toLocaleString()} m` },
                                { label: 'Penduduk', value: `${saribudolokData.population.toLocaleString()}+` },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-lg font-black text-white tabular-nums">{stat.value}</div>
                                    <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Bottom Gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
