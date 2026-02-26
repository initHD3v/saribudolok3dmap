'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    unit?: string;
    delay?: number;
}

export default function StatCard({ icon: Icon, label, value, unit, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
            className="group relative p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] hover:bg-blue-500/[0.06] hover:border-blue-500/20 transition-all duration-300"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Icon className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-[0.15em]">
                    {label}
                </span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                    {value}
                </span>
                {unit && (
                    <span className="text-xs font-bold text-foreground/30">{unit}</span>
                )}
            </div>
        </motion.div>
    );
}
