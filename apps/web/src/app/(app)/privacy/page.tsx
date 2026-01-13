import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@iconify/react';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Orbis - learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#032125] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="font-hebden text-4xl sm:text-5xl font-bold text-[#C7F4FA] mb-4">
                        Privacy Policy
                    </h1>
                    <p className="font-nunito text-base text-[#C7F4FA]/70">
                        Last Updated: December 7, 2025
                    </p>
                </div>

                <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#084B54] rounded-3xl p-8 sm:p-12 space-y-8">

                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            1. Information We Collect
                        </h2>
                        <h3 className="font-hebden text-xl font-semibold text-[#C7F4FA] mb-3">
                            Account Information
                        </h3>
                        <ul className="space-y-2 ml-6 mb-4">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Email address, username, and profile information</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Authentication credentials</span>
                            </li>
                        </ul>
                        <h3 className="font-hebden text-xl font-semibold text-[#C7F4FA] mb-3">
                            Content and Usage Data
                        </h3>
                        <ul className="space-y-2 ml-6 mb-4">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Uploaded resources and server listings</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Comments, reviews, and community interactions</span>
                            </li>
                        </ul>
                        <h3 className="font-hebden text-xl font-semibold text-[#C7F4FA] mb-3">
                            Technical Information
                        </h3>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>IP address, device information, and browser type</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Cookies and tracking technologies</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            2. How We Use Your Information
                        </h2>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Providing and maintaining Platform functionality</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Personalizing your experience</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Moderating content and enforcing guidelines</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Analyzing usage and improving services</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            3. Information Sharing
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            We do not sell your personal information. We may share data:
                        </p>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Publicly (username, avatar, uploaded content)</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>With service providers for hosting and analytics</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>When required by law</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            4. Data Security
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            We use encryption, secure password hashing, and regular security audits to protect your data. However, no internet transmission is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            5. Your Rights
                        </h2>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Access and download your data</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Correct inaccurate information</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Delete your account</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Opt-out of marketing communications</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            6. Contact Us
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            Questions about privacy? Contact us through our{' '}
                            <Link href="/contact" className="text-[#109EB1] hover:text-[#15C8E0] transition-colors underline">
                                Contact Page
                            </Link>
                            {' '}or{' '}
                            <a
                                href="https://discord.gg/6h2eVhntPf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#109EB1] hover:text-[#15C8E0] transition-colors underline"
                            >
                                Discord
                            </a>
                            .
                        </p>
                    </section>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all shadow-lg"
                    >
                        <Icon ssr={true} icon="mdi:arrow-left" width="20" height="20" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
