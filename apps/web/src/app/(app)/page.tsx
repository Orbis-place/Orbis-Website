import Image from 'next/image';
import type { Metadata } from 'next';
import styles from './page.module.css';
import { Rotater } from '@/components/home/Rotater';
import { ProjectShowcase } from '@/components/home/ProjectShowcase';
import { FeatureBlobs } from '@/components/home/FeatureBlobs';
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Home',
    description: 'Discover, create and connect with the best Hytale mods, worlds, plugins and servers. Join the ultimate Hytale community hub for players and creators.',
    openGraph: {
        title: 'Orbis - Your Hytale Modding & Server Hub',
        description: 'Discover, create and connect with the best Hytale mods, worlds, plugins and servers.',
        type: 'website',
        url: '/',
    },
    twitter: {
        title: 'Orbis - Your Hytale Modding & Server Hub',
        description: 'Discover, create and connect with the best Hytale mods, worlds, plugins and servers.',
    },
};

export default function Home() {
    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className="min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-80px)] pb-12 md:pb-28 flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:px-8 relative gap-8 md:gap-0">
                <div className="flex flex-col items-start gap-6 md:gap-[30px] w-full max-w-full md:max-w-[590px] md:ml-[151px] ml-0 mt-8 md:mt-0">
                    {/* Text Content */}
                    <div className="flex flex-col items-start gap-4 md:gap-[18px] w-full">
                        {/* Title Group */}
                        <div className="w-full">
                            <h1 className="font-hebden font-semibold text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[48px] text-[#C7F4FA]">
                                Welcome to Orbis: Hytale&apos;s #1
                            </h1>
                            <Rotater
                                cellClassName="font-hebden font-semibold text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[48px] text-[#15C8E0]"
                                className="text-3xl h-8 sm:h-[32px] md:h-12"
                                names={[
                                    'Server Listing',
                                    'Marketplace',
                                    'Community Hub',
                                ]}
                            />
                        </div>

                        {/* Subtitle */}
                        <p className="font-nunito text-base sm:text-lg leading-[24px] md:leading-[26px] text-[#C7F4FA] max-w-full md:max-w-[420px]">
                            Discover, Create and Connect with best mods, worlds, and servers.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-5 w-full sm:w-auto">
                        <Link
                            href="/marketplace"
                            prefetch={false}
                            className="flex items-center justify-center px-[18px] py-[14px] md:py-[16px] gap-2.5 bg-[#109EB1] rounded-full w-full sm:w-auto sm:min-w-[158px] h-[48px] md:h-[52px] hover:bg-[#0d8a9b] transition-all cursor-pointer"
                        >
                            <span className="font-hebden font-semibold text-base md:text-[17px] leading-[20px] text-[#C7F4FA]">
                                Get Started
                            </span>
                        </Link>

                        <button
                            className="flex items-center justify-center px-[18px] py-[14px] md:py-[16px] gap-2.5 bg-[rgba(152,234,245,0.25)] border-2 border-[rgba(152,234,245,0.25)] rounded-full w-full sm:w-auto sm:min-w-[198px] h-[48px] md:h-[52px] hover:bg-[rgba(152,234,245,0.35)] transition-all cursor-pointer">
                            <span className="font-hebden font-semibold text-base md:text-[17px] leading-[20px] text-[#C7F4FA]">
                                Browse Content
                            </span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div
                        className="flex flex-row items-center px-4 md:px-[18px] py-3 md:py-3.5 gap-2.5 w-full h-[48px] md:h-[52px] bg-[#06363D] border border-[#084B54] rounded-[84px]">
                        <div className="flex flex-row items-center justify-center gap-3 md:gap-[15px] w-full">
                            {/* Search Icon */}
                            <svg
                                className="w-5 h-5 md:w-6 md:h-6 text-[rgba(199,244,250,0.5)] flex-shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>

                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search Anything"
                                className="bg-transparent border-none outline-none font-nunito text-sm md:text-[17px] leading-[24px] text-[rgba(199,244,250,0.5)] placeholder:text-[rgba(199,244,250,0.5)] w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Kweebec Image */}
                <div className="relative md:mr-[151px] mr-0 animate-float w-full md:w-auto flex justify-center md:block">
                    <Image
                        src="/kweebec.webp"
                        alt="Kweebec character"
                        width={300}
                        height={300}
                        style={{
                            transform: 'scaleX(-1)',
                            filter: 'drop-shadow(0 0 15px rgba(199, 244, 250, 0.3)) drop-shadow(0 0 30px rgba(21, 200, 224, 0.2))',
                        }}
                        className="object-contain drop-shadow-2xl md:w-[400px] md:h-[400px] w-[250px] h-[250px]"
                        priority
                    />
                </div>
            </section>

            {/* Projects Showcase Section */}
            <ProjectShowcase />

            {/* Feature Blobs Section */}
            <FeatureBlobs />

        </div>
    );
}