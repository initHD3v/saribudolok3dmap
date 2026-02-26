'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Utensils, Briefcase, Music, Globe } from 'lucide-react';
import Image from 'next/image';
import ImageGallery from '@/components/ui/ImageGallery';
import saribudolokData from '@/data/saribudolokData';

export default function TabCulture() {
    const { culture, cultureDescription, cultureImage, economyDescription, mainCommodities, farmImage } = saribudolokData;

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
        >
            {/* Culture Header Image */}
            <div className="relative h-36 rounded-2xl overflow-hidden">
                <Image
                    src={cultureImage}
                    alt="Budaya Simalungun"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                    <h3 className="text-lg font-black text-white">Budaya Simalungun</h3>
                    <p className="text-[10px] text-white/60 font-semibold">{culture.ethnicity}</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-[13px] leading-relaxed text-foreground/70">
                {cultureDescription}
            </p>

            {/* Ethnicity & Language */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.05]">
                    <Globe className="w-3.5 h-3.5 text-blue-500 mb-1.5" />
                    <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest block mb-0.5">Bahasa</span>
                    <span className="text-[11px] font-semibold text-foreground/80">{culture.language}</span>
                </div>
                <div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.05]">
                    <Heart className="w-3.5 h-3.5 text-rose-500 mb-1.5" />
                    <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest block mb-0.5">Agama</span>
                    <span className="text-[11px] font-semibold text-foreground/80">{culture.religion}</span>
                </div>
            </div>

            {/* Traditions */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Music className="w-3.5 h-3.5 text-blue-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500">
                        Tradisi & Upacara
                    </h3>
                </div>
                <div className="space-y-2">
                    {culture.traditions.map((t) => (
                        <div key={t.name} className="p-3 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04]">
                            <h4 className="text-[12px] font-bold text-foreground/90 mb-1">{t.name}</h4>
                            <p className="text-[11px] leading-relaxed text-foreground/50">{t.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cuisine */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-500">
                        Kuliner Khas
                    </h3>
                </div>
                <div className="space-y-2">
                    {culture.cuisine.map((c) => (
                        <div key={c.name} className="p-3 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04]">
                            <h4 className="text-[12px] font-bold text-foreground/90 mb-0.5">{c.name}</h4>
                            <p className="text-[11px] leading-relaxed text-foreground/50">{c.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Economy */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500">
                        Ekonomi & Mata Pencaharian
                    </h3>
                </div>

                <div className="relative h-28 rounded-2xl overflow-hidden mb-3">
                    <Image
                        src={farmImage}
                        alt="Pertanian Saribudolok"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 320px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <p className="text-[12px] leading-relaxed text-foreground/60 mb-3">
                    {economyDescription}
                </p>

                {/* Commodities */}
                <div className="flex flex-wrap gap-1.5">
                    {mainCommodities.map((c) => (
                        <span
                            key={c}
                            className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        >
                            {c}
                        </span>
                    ))}
                </div>

                {/* Livelihoods */}
                <div className="mt-3 space-y-1.5">
                    {culture.livelihoods.map((l) => (
                        <div key={l} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[11px] text-foreground/60">{l}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gallery */}
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/40 mb-3">
                    Galeri Foto
                </h3>
                <ImageGallery
                    images={[
                        { src: '/images/hero.png', caption: 'Panorama dataran tinggi Saribudolok' },
                        { src: '/images/budaya-simalungun.png', caption: 'Tarian adat Simalungun' },
                        { src: '/images/pertanian.png', caption: 'Pertanian hortikultura' },
                        { src: '/images/wisata-paropo.png', caption: 'Wisata Paropo - Danau Toba' },
                        { src: '/images/wisata-aek-nauli.png', caption: 'Air panas Aek Nauli' },
                        { src: '/images/wisata-simalem.png', caption: 'Taman Simalem Resort' },
                    ]}
                />
            </div>
        </motion.div>
    );
}
