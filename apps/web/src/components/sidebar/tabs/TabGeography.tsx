'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Thermometer, Droplets, Compass, Mountain, Layers } from 'lucide-react';
import saribudolokData from '@/data/saribudolokData';

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04] hover:bg-blue-500/[0.04] transition-colors">
            <div className="p-1.5 rounded-lg bg-blue-500/10 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-[0.15em] block mb-0.5">
                    {label}
                </span>
                <span className="text-[12px] font-semibold text-foreground/80 leading-tight">{value}</span>
            </div>
        </div>
    );
}

export default function TabGeography() {
    const { climate, boundaries, topography, soilType, geographyDescription } = saribudolokData;

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
        >
            {/* Description */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-foreground/40 mb-2">
                    Kondisi Geografis
                </h3>
                <p className="text-[13px] leading-relaxed text-foreground/70">
                    {geographyDescription}
                </p>
            </div>

            {/* Topography & Soil */}
            <div className="space-y-2">
                <InfoRow icon={Mountain} label="Topografi" value={topography} />
                <InfoRow icon={Layers} label="Jenis Tanah" value={soilType} />
            </div>

            {/* Climate Section */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-foreground/40 mb-3">
                    Data Iklim
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <InfoRow icon={Thermometer} label="Suhu Rata-rata" value={climate.avgTemp} />
                    <InfoRow icon={Thermometer} label="Suhu Min / Max" value={`${climate.minTemp} / ${climate.maxTemp}`} />
                    <InfoRow icon={CloudRain} label="Curah Hujan" value={climate.rainfall} />
                    <InfoRow icon={Droplets} label="Kelembapan" value={climate.humidity} />
                </div>
                <div className="mt-2">
                    <InfoRow icon={CloudRain} label="Musim Terbaik Berkunjung" value={climate.bestSeason} />
                </div>
            </div>

            {/* Boundaries */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-foreground/40 mb-3">
                    Batas Wilayah
                </h3>
                <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06]">
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { dir: 'Utara', icon: '↑', value: boundaries.utara },
                            { dir: 'Selatan', icon: '↓', value: boundaries.selatan },
                            { dir: 'Timur', icon: '→', value: boundaries.timur },
                            { dir: 'Barat', icon: '←', value: boundaries.barat },
                        ].map((b) => (
                            <div key={b.dir} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center text-xs text-blue-500 rounded bg-blue-500/10 font-bold">
                                        {b.icon}
                                    </span>
                                    <span className="text-[11px] text-foreground/50 font-semibold">{b.dir}</span>
                                </div>
                                <span className="text-[11px] font-bold text-foreground/80">{b.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
