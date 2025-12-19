'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Package, Globe, Plug, Image as ImageIcon, Boxes, Database, Wrench } from 'lucide-react';
import { ReactNode } from 'react';
import { motion, LayoutGroup } from 'framer-motion';

type TabConfig = {
    id: string;
    label: string;
    href: string;
    icon?: ReactNode;
};

const tabs: TabConfig[] = [
    { id: 'mods', label: 'Mods', href: '/mods', icon: <Box className="w-6 h-6" /> },
    { id: 'modpacks', label: 'Modpacks', href: '/modpacks', icon: <Package className="w-6 h-6" /> },
    { id: 'worlds', label: 'Worlds', href: '/worlds', icon: <Globe className="w-6 h-6" /> },
    { id: 'plugins', label: 'Plugins', href: '/plugins', icon: <Plug className="w-6 h-6" /> },
    { id: 'asset-packs', label: 'Asset Packs', href: '/asset-packs', icon: <ImageIcon className="w-6 h-6" /> },
    { id: 'prefabs', label: 'Prefabs', href: '/prefabs', icon: <Boxes className="w-6 h-6" /> },
    { id: 'data-packs', label: 'Data Packs', href: '/data-packs', icon: <Database className="w-6 h-6" /> },
    { id: 'tools-scripts', label: 'Tools & Scripts', href: '/tools-scripts', icon: <Wrench className="w-6 h-6" /> },
];

export default function MarketplaceLayoutClient({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="relative w-full min-h-screen">
            {/* Gaia Background Image - hidden on mobile, visible on tablet+ */}
            <div className="hidden sm:block fixed top-0 left-0 w-full h-[280px] lg:h-[380px] z-0">
                <Image
                    src="/gaia.webp"
                    alt="Gaia"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#032125]" />
            </div>

            {/* Spacer for the background - only on tablet+ */}
            <div className="hidden sm:block relative h-[220px] lg:h-[280px] z-10" />

            {/* Tab Navigation - Different positioning for mobile */}
            <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-[120px] lg:top-[140px] z-20 w-full sm:w-auto px-4 sm:px-0 pt-4 sm:pt-0">
                <nav
                    className="flex flex-row items-center mt-6 sm:mt-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-[124px] w-full sm:w-fit mx-auto overflow-x-auto scrollbar-hide bg-[#032125] shadow-lg sm:shadow-none"
                    style={{
                        height: '52px',
                        maxHeight: '64px',
                        // Gradient uniquement sur mobile
                        background: 'linear-gradient(135deg, rgba(6, 54, 61, 0.95) 0%, rgba(8, 75, 84, 0.95) 100%)',
                    }}
                >
                    <style jsx>{`
                        @media (min-width: 640px) {
                            nav {
                                background: rgba(3, 33, 37, 1) !important;
                            }
                        }
                    `}</style>

                    <div className="flex flex-row items-center gap-1 sm:gap-0">
                        <LayoutGroup>
                            {tabs.map((tab) => {
                                const isActive = pathname === tab.href;

                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href}
                                        className={`
                                            relative flex items-center justify-center px-2 sm:px-[15px] py-2 sm:py-2.5 rounded-[57px] transition-colors flex-shrink-0
                                            ${!isActive ? 'hover:bg-[#084B54] sm:hover:bg-[#06363D]/50' : ''}
                                            ${tab.icon ? 'gap-1.5 sm:gap-2.5' : ''}
                                        `}
                                        style={{
                                            height: '36px',
                                            minWidth: 'fit-content'
                                        }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-[#109EB1] sm:bg-[#06363D] rounded-[57px]"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2.5">
                                            {tab.icon && isActive && (
                                                <span className="text-[#C7F4FA] sm:text-[#109EB1] hidden sm:inline">
                                                    {tab.icon}
                                                </span>
                                            )}
                                            <span
                                                className={`font-semibold text-xs sm:text-sm lg:text-base whitespace-nowrap ${isActive ? 'text-[#C7F4FA] sm:text-[#109EB1]' : 'text-[#C7F4FA]'
                                                    }`}
                                                style={{ fontFamily: 'Hebden, sans-serif' }}
                                            >
                                                {tab.label}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </LayoutGroup>
                    </div>
                </nav>
            </div>

            {/* Content Area - Different margins for mobile */}
            <div
                className="relative w-full min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-220px)] lg:min-h-[calc(100vh-280px)] mt-4 sm:-mt-[40px] lg:-mt-[50px] z-10"
                style={{ backgroundColor: 'rgba(3, 33, 37, 1)' }}
            >
                {children}
            </div>
        </div>
    );
}
