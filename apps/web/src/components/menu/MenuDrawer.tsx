'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Map, BookOpen, Compass, Bot, Github, Mail, ExternalLink, MapPin } from 'lucide-react';
import saribudolokData from '@/data/saribudolokData';
import type { SidebarTabId } from '@/components/sidebar/InfoSidebar';

interface MenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (tab: SidebarTabId) => void;
}

const menuSections = [
    {
        title: 'Navigasi',
        items: [
            { id: 'overview' as SidebarTabId, label: 'Ringkasan Wilayah', icon: Compass, desc: 'Informasi umum Saribudolok' },
            { id: 'geography' as SidebarTabId, label: 'Data Geografi', icon: Map, desc: 'Topografi, iklim, batas wilayah' },
            { id: 'tourism' as SidebarTabId, label: 'Destinasi Wisata', icon: MapPin, desc: 'Paropo, Aek Nauli, Taman Simalem' },
            { id: 'culture' as SidebarTabId, label: 'Budaya & Ekonomi', icon: BookOpen, desc: 'Tradisi, kuliner, mata pencaharian' },
        ],
    },
];

export default function MenuDrawer({ isOpen, onClose, onNavigate }: MenuDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-[360px] z-[81] bg-background/95 backdrop-blur-2xl border-l border-foreground/10 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-foreground/5">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-foreground">Menu</h2>
                                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Saribudolok Platform</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                            {menuSections.map((section) => (
                                <div key={section.title}>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-3">
                                        {section.title}
                                    </h3>
                                    <div className="space-y-1.5">
                                        {section.items.map((item, idx) => (
                                            <motion.button
                                                key={item.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => { onNavigate(item.id); onClose(); }}
                                                className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-blue-500/[0.06] border border-transparent hover:border-blue-500/15 transition-all text-left group"
                                            >
                                                <div className="p-2 rounded-lg bg-foreground/[0.04] group-hover:bg-blue-500/10 transition-colors">
                                                    <item.icon className="w-4 h-4 text-foreground/40 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">{item.label}</div>
                                                    <div className="text-[10px] text-foreground/30">{item.desc}</div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* About Section */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-3">
                                    Tentang
                                </h3>
                                <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] space-y-3">
                                    <p className="text-[12px] leading-relaxed text-foreground/50">
                                        <strong className="text-foreground/70">Saribudolok 3D Geo Experience</strong> adalah platform interaktif
                                        untuk menjelajahi dan mengenal Desa Saribudolok melalui peta 3D dan informasi komprehensif.
                                    </p>
                                    <div className="space-y-1.5 text-[11px]">
                                        <div className="flex justify-between text-foreground/40">
                                            <span>Data Source</span>
                                            <span className="text-foreground/60">Peta Nusa / BPS</span>
                                        </div>
                                        <div className="flex justify-between text-foreground/40">
                                            <span>Map Provider</span>
                                            <span className="text-foreground/60">MapTiler / MapLibre</span>
                                        </div>
                                        <div className="flex justify-between text-foreground/40">
                                            <span>Coordinates</span>
                                            <span className="text-foreground/60">{saribudolokData.latitude}° LU, {saribudolokData.longitude}° BT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-foreground/5">
                            <p className="text-[9px] text-foreground/25 font-bold uppercase tracking-widest text-center">
                                © 2026 Saribudolok Geo Platform
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
