'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Mountain, Palmtree, Theater, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import saribudolokData from '@/data/saribudolokData';
import TabOverview from './tabs/TabOverview';
import TabGeography from './tabs/TabGeography';
import TabTourism from './tabs/TabTourism';
import TabCulture from './tabs/TabCulture';

export const SIDEBAR_TABS = [
    { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
    { id: 'geography', label: 'Geografi', icon: Mountain },
    { id: 'tourism', label: 'Wisata', icon: Palmtree },
    { id: 'culture', label: 'Budaya', icon: Theater },
] as const;

export type SidebarTabId = typeof SIDEBAR_TABS[number]['id'];

interface InfoSidebarProps {
    isDarkMode?: boolean;
    activeTab: SidebarTabId;
    onTabChange: (tab: SidebarTabId) => void;
    collapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
}

export default function InfoSidebar({ isDarkMode, activeTab, onTabChange, collapsed, onCollapsedChange }: InfoSidebarProps) {
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <TabOverview />;
            case 'geography': return <TabGeography />;
            case 'tourism': return <TabTourism />;
            case 'culture': return <TabCulture />;
        }
    };

    return (
        <>
            {/* Collapse Toggle */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onCollapsedChange(!collapsed)}
                className="absolute top-1/2 -translate-y-1/2 z-50 glass-panel p-2 rounded-full text-foreground hover:text-blue-500 transition-colors shadow-lg"
                style={{ right: collapsed ? 12 : 340 }}
            >
                {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </motion.button>

            {/* Sidebar Panel */}
            <motion.aside
                initial={{ x: 400, opacity: 0 }}
                animate={{
                    x: collapsed ? 400 : 0,
                    opacity: collapsed ? 0 : 1,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-24 right-6 bottom-24 w-[340px] z-40 glass-panel rounded-[2rem] overflow-hidden flex flex-col pointer-events-auto shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-foreground/5 bg-blue-500/[0.03]">
                    <div className="flex items-center gap-2 mb-2">
                        <Compass className="w-4 h-4 text-blue-500 animate-spin-slow" />
                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.15em]">
                            Sector {saribudolokData.code}
                        </span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight mb-3">
                        {saribudolokData.officialName}
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="bg-blue-500/10 text-blue-500 text-[8px] px-2 py-0.5 rounded-full border border-blue-500/20 font-bold tracking-wider uppercase">
                            Kab. {saribudolokData.kabupaten}
                        </span>
                        <span className="bg-foreground/5 text-foreground/40 text-[8px] px-2 py-0.5 rounded-full border border-foreground/10 font-bold tracking-wider uppercase">
                            Kec. {saribudolokData.kecamatan}
                        </span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="px-4 pt-3 pb-0 border-b border-foreground/5">
                    <div className="flex gap-1">
                        {SIDEBAR_TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`
                    relative flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[8px] font-bold uppercase tracking-wider transition-colors
                    ${isActive ? 'text-blue-500' : 'text-foreground/30 hover:text-foreground/60'}
                  `}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute bottom-0 left-2 right-2 h-[2px] bg-blue-500 rounded-full"
                                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <div key={activeTab}>
                            {renderTabContent()}
                        </div>
                    </AnimatePresence>
                </div>
            </motion.aside>
        </>
    );
}
