'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, Camera, Calendar, Map, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import saribudolokData from '@/data/saribudolokData';

export default function TabTourism() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { tourismOverview, destinations } = saribudolokData;

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
        >
            {/* Overview */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-foreground/40 mb-2">
                    Potensi Wisata
                </h3>
                <p className="text-[13px] leading-relaxed text-foreground/70">
                    {tourismOverview}
                </p>
            </div>

            {/* Destination Cards */}
            <div className="space-y-3">
                {destinations.map((dest, idx) => {
                    const isExpanded = expandedId === dest.id;
                    return (
                        <motion.div
                            key={dest.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="rounded-2xl overflow-hidden border border-foreground/[0.06] bg-foreground/[0.02] hover:border-blue-500/20 transition-colors"
                        >
                            {/* Image + Title */}
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : dest.id)}
                                className="w-full text-left"
                            >
                                <div className="relative h-32 w-full">
                                    <Image
                                        src={dest.image}
                                        alt={dest.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 320px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500/80 text-white px-2 py-1 rounded-full">
                                            {dest.category}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                        <div>
                                            <h4 className="text-base font-black text-white leading-tight">{dest.name}</h4>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            className="p-1 rounded-full bg-white/20 backdrop-blur-sm"
                                        >
                                            <ChevronDown className="w-4 h-4 text-white" />
                                        </motion.div>
                                    </div>
                                </div>
                            </button>

                            {/* Expandable Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 space-y-3">
                                            <p className="text-[12px] leading-relaxed text-foreground/60">
                                                {dest.description}
                                            </p>
                                            <div className="space-y-1.5">
                                                {dest.highlights.map((hl) => (
                                                    <div key={hl} className="flex items-center gap-2">
                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                        <span className="text-[11px] text-foreground/70">{hl}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
