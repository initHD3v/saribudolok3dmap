'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Ruler, Mountain, Users, Thermometer, Info } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import saribudolokData from '@/data/saribudolokData';

export default function TabOverview() {
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
                    Apa itu Saribudolok?
                </h3>
                <p className="text-[13px] leading-relaxed text-foreground/70">
                    {saribudolokData.description}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5">
                <StatCard icon={Ruler} label="Luas Wilayah" value={saribudolokData.areaKm2} unit="km²" delay={0.1} />
                <StatCard icon={Mountain} label="Elevasi" value={saribudolokData.elevation.toLocaleString()} unit="m dpl" delay={0.15} />
                <StatCard icon={Users} label="Penduduk" value={`${saribudolokData.population.toLocaleString()}+`} delay={0.2} />
                <StatCard icon={Thermometer} label="Suhu Rata-rata" value={saribudolokData.climate.avgTemp} delay={0.25} />
            </div>

            {/* Administrative Info */}
            <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.15em]">
                        Info Wilayah
                    </span>
                </div>
                <div className="space-y-2">
                    {[
                        { label: 'Kode Wilayah', value: saribudolokData.code },
                        { label: 'Kecamatan', value: saribudolokData.kecamatan },
                        { label: 'Kabupaten', value: saribudolokData.kabupaten },
                        { label: 'Provinsi', value: saribudolokData.provinsi },
                        { label: 'Koordinat', value: `${saribudolokData.latitude}° LU, ${saribudolokData.longitude}° BT` },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                            <span className="text-[11px] text-foreground/40">{item.label}</span>
                            <span className="text-[11px] font-bold text-foreground/80">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quote */}
            <div className="p-4 bg-blue-500/[0.05] rounded-2xl border border-blue-500/10 italic">
                <p className="text-xs leading-relaxed text-foreground/50">
                    &quot;Pusat agropolitan Simalungun dengan karakteristik tanah vulkanik subur dan suhu sejuk pegunungan.&quot;
                </p>
            </div>
        </motion.div>
    );
}
