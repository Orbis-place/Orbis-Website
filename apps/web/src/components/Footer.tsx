'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#06363D] border-t border-[#084B54] mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-4">
                        <Link href="/">
                            <Image
                                src="/navbar_header.png"
                                alt="Orbis Logo"
                                width={139}
                                height={48}
                                priority
                            />
                        </Link>
                        <p className="text-sm text-[#C7F4FA]/70 font-nunito">
                            Orbis is the place for the Hytale community - servers, resources, and more.

                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3">
                            <a
                                href="https://discord.gg/6h2eVhntPf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#084B54] hover:bg-[#109EB1] transition-colors"
                                aria-label="Discord"
                            >
                                <Icon ssr={true} icon="mdi:discord" width="20" height="20" className="text-[#C7F4FA]" />
                            </a>
                            <a
                                href="https://x.com/orbisplace"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#084B54] hover:bg-[#109EB1] transition-colors"
                                aria-label="X"
                            >
                                <svg
                                    className="text-[#C7F4FA] w-5 h-5"
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-v-71fa7669-s=""><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" data-v-71fa7669-s=""></path></svg>
                            </a>
                            <a
                                href="https://github.com/orbis-place"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#084B54] hover:bg-[#109EB1] transition-colors"
                                aria-label="GitHub"
                            >
                                <Icon ssr={true} icon="mdi:github" width="20" height="20" className="text-[#C7F4FA]" />
                            </a>
                        </div>
                    </div>

                    {/* Marketplace */}
                    <div className="space-y-4">
                        <h3 className="font-hebden font-semibold text-base text-[#C7F4FA]">
                            Marketplace
                        </h3>
                        <ul className="space-y-2 font-nunito text-sm">
                            <li>
                                <Link href="/mods" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Mods
                                </Link>
                            </li>
                            <li>
                                <Link href="/modpacks" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Modpacks
                                </Link>
                            </li>
                            <li>
                                <Link href="/worlds" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Worlds
                                </Link>
                            </li>
                            <li>
                                <Link href="/plugins" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Plugins
                                </Link>
                            </li>
                            <li>
                                <Link href="/asset-packs" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Asset Packs
                                </Link>
                            </li>
                            <li>
                                <Link href="/premade-servers" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Prefabs
                                </Link>
                            </li>
                            <li>
                                <Link href="/data-packs" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Data packs
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools-scripts" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Tools & Scripts
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div className="space-y-4">
                        <h3 className="font-hebden font-semibold text-base text-[#C7F4FA]">
                            Community
                        </h3>
                        <ul className="space-y-2 font-nunito text-sm">
                            <li>
                                <Link href="/servers" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Server Discovery
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="https://docs.orbis.place" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h3 className="font-hebden font-semibold text-base text-[#C7F4FA]">
                            Legal
                        </h3>
                        <ul className="space-y-2 font-nunito text-sm">
                            <li>
                                <Link href="/terms" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/guidelines" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Community Guidelines
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-[#084B54] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                        © {currentYear} Orbis. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-nunito">
                        <Link href="/sitemap.xml" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                            Sitemap
                        </Link>
                        <Link href="https://status.orbis.place/" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                            Status
                        </Link>
                        <Link href="https://discord.gg/6h2eVhntPf" className="text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors">
                            Support
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
