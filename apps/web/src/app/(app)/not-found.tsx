import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#032125] flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Number with gradient */}
                <div className="mb-8">
                    <h1
                        className="font-hebden font-bold text-[120px] sm:text-[180px] leading-none bg-gradient-to-r from-[#109EB1] to-[#C7F4FA] bg-clip-text text-transparent"
                        style={{
                            textShadow: '0 0 80px rgba(16, 158, 177, 0.3)'
                        }}
                    >
                        404
                    </h1>
                </div>

                {/* Icon */}
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#06363D] to-[#084B54] border-2 border-[#109EB1]/30">
                        <Icon ssr={true} icon="mdi:compass-off-outline" width="48" height="48" className="text-[#109EB1]" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="font-hebden text-3xl sm:text-4xl font-bold text-[#C7F4FA] mb-4">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="font-nunito text-base sm:text-lg text-[#C7F4FA]/70 mb-8 max-w-md mx-auto">
                    Looks like you've ventured into uncharted territory. This page doesn't exist in the Orbis universe.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all shadow-lg"
                    >
                        <Icon ssr={true} icon="mdi:home" width="20" height="20" />
                        Back to Home
                    </Link>

                    <Link
                        href="/mods"
                        className="flex items-center gap-2 px-6 py-3 bg-[#06363D] hover:bg-[#084B54] border-2 border-[#109EB1]/30 rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all"
                    >
                        <Icon ssr={true} icon="mdi:package-variant" width="20" height="20" />
                        Browse Marketplace
                    </Link>
                </div>


            </div>
        </div>
    );
}
