import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@iconify/react';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for Orbis - the Hytale community marketplace and server hub.',
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#032125] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="font-hebden text-4xl sm:text-5xl font-bold text-[#C7F4FA] mb-4">
                        Terms of Service
                    </h1>
                    <p className="font-nunito text-base text-[#C7F4FA]/70">
                        Last Updated: December 7, 2025
                    </p>
                </div>

                {/* Content */}
                <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#084B54] rounded-3xl p-8 sm:p-12 space-y-8">

                    {/* Section 1 */}
                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            1. Acceptance of Terms
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            By accessing and using Orbis ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Platform.
                        </p>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            We reserve the right to update and change these Terms of Service at any time without notice. Continued use of the Platform after any such changes shall constitute your consent to such changes.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            2. Account Registration
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            To access certain features of the Platform, you must register for an account. When you register, you agree to:
                        </p>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Provide accurate, current, and complete information</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Maintain and promptly update your account information</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Maintain the security of your password and account</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Be responsible for all activities that occur under your account</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            3. Content Submission and Licensing
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            When you upload content to Orbis (including but not limited to mods, modpacks, worlds, plugins, asset packs, and server listings), you grant Orbis a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, and distribute such content on the Platform.
                        </p>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            You represent and warrant that:
                        </p>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>You own or have the necessary rights to upload and share the content</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Your content does not infringe third-party intellectual property rights</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Your content complies with all applicable laws and regulations</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            4. Prohibited Activities
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            You agree not to engage in any of the following activities:
                        </p>
                        <ul className="space-y-2 ml-6 mb-4">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Uploading malicious code, viruses, or harmful software</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Stealing or plagiarizing content from other creators</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Uploading content that violates Hytale's terms of service</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Harassing, threatening, or abusing other users</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Attempting to gain unauthorized access to the Platform or other accounts</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Using automated tools to scrape or download content in bulk</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            5. Intellectual Property
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            The Platform and its original content, features, and functionality are owned by Orbis and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                        </p>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            Hytale is a trademark of Hypixel Studios. Orbis is not affiliated with, endorsed by, or sponsored by Hypixel Studios.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            6. Disclaimers and Limitations of Liability
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:
                        </p>
                        <ul className="space-y-2 ml-6 mb-4">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>The Platform will be uninterrupted or error-free</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>User-generated content is safe, accurate, or appropriate</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>The Platform will meet your specific requirements</span>
                            </li>
                        </ul>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            In no event shall Orbis be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            7. Termination
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="font-hebden text-2xl font-semibold text-[#109EB1] mb-4">
                            8. Contact Information
                        </h2>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            If you have any questions about these Terms of Service, please contact us through our{' '}
                            <Link href="/contact" className="text-[#109EB1] hover:text-[#15C8E0] transition-colors underline">
                                Contact Page
                            </Link>
                            {' '}or join our{' '}
                            <a
                                href="https://discord.gg/6h2eVhntPf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#109EB1] hover:text-[#15C8E0] transition-colors underline"
                            >
                                Discord server
                            </a>
                            .
                        </p>
                    </section>
                </div>

                {/* Back to Home Button */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all shadow-lg"
                    >
                        <Icon icon="mdi:arrow-left" width="20" height="20" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
