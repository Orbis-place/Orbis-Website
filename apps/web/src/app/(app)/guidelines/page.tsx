import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@iconify-icon/react';

export const metadata: Metadata = {
    title: 'Community Guidelines',
    description: 'Community Guidelines for Orbis - creating a respectful and creative Hytale community.',
};

export default function CommunityGuidelines() {
    return (
        <div className="min-h-screen bg-[#032125] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="font-hebden text-4xl sm:text-5xl font-bold text-[#C7F4FA] mb-4">
                        Community Guidelines
                    </h1>
                    <p className="font-nunito text-base text-[#C7F4FA]/70">
                        Last Updated: December 7, 2024
                    </p>
                </div>

                <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#084B54] rounded-3xl p-8 sm:p-12 space-y-8">

                    <div className="text-center mb-8">
                        <p className="font-nunito text-lg text-[#C7F4FA]/90 leading-relaxed">
                            Orbis is built on the foundation of creativity, collaboration, and respect. These guidelines help us maintain a welcoming community for all Hytale enthusiasts.
                        </p>
                    </div>

                    <section>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                <Icon icon="mdi:account-heart" width="24" height="24" className="text-[#109EB1]" />
                            </div>
                            <h2 className="font-hebden text-2xl font-semibold text-[#109EB1]">
                                Be Respectful and Inclusive
                            </h2>
                        </div>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Treat all community members with kindness and respect</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>No harassment, hate speech, or discriminatory language</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Welcome newcomers and help them learn</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Keep discussions constructive and on-topic</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                <Icon icon="mdi:star-check" width="24" height="24" className="text-[#109EB1]" />
                            </div>
                            <h2 className="font-hebden text-2xl font-semibold text-[#109EB1]">
                                Create Quality Content
                            </h2>
                        </div>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Provide clear descriptions and accurate information</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Use appropriate tags and categories</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Include screenshots or demos when applicable</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Keep your resources updated and maintained</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                <Icon icon="mdi:copyright" width="24" height="24" className="text-[#109EB1]" />
                            </div>
                            <h2 className="font-hebden text-2xl font-semibold text-[#109EB1]">
                                Respect Intellectual Property
                            </h2>
                        </div>
                        <ul className="space-y-2 ml-6 mb-4">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Only upload content you have created or have permission to share</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Give credit to other creators when using their work</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Respect the licenses of resources you use</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Do not re-upload or claim others' work as your own</span>
                            </li>
                        </ul>
                        <div className="bg-[#109EB1]/10 border-l-4 border-[#109EB1] p-4 rounded">
                            <p className="font-nunito text-sm text-[#C7F4FA]/80">
                                <strong className="text-[#C7F4FA]">Note:</strong> Plagiarism is taken very seriously and may result in immediate account suspension.
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                <Icon icon="mdi:shield-check" width="24" height="24" className="text-[#109EB1]" />
                            </div>
                            <h2 className="font-hebden text-2xl font-semibold text-[#109EB1]">
                                Keep Content Safe
                            </h2>
                        </div>
                        <ul className="space-y-2 ml-6 mb-4">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>No malicious code, viruses, or harmful software</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>No exploits or cheats that violate game integrity</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>No inappropriate or NSFW content</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Warn users about potential compatibility issues</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                <Icon icon="mdi:server-network" width="24" height="24" className="text-[#109EB1]" />
                            </div>
                            <h2 className="font-hebden text-2xl font-semibold text-[#109EB1]">
                                Server Listing Guidelines
                            </h2>
                        </div>
                        <ul className="space-y-2 ml-6">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Provide accurate server information and uptime</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Update your listing when details change</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Do not spam or artificially boost your server ratings</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Follow server-specific rules and moderation policies</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                <Icon icon="mdi:flag" width="24" height="24" className="text-[#109EB1]" />
                            </div>
                            <h2 className="font-hebden text-2xl font-semibold text-[#109EB1]">
                                Reporting Violations
                            </h2>
                        </div>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            If you encounter content or behavior that violates these guidelines:
                        </p>
                        <ul className="space-y-2 ml-6 mb-4">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Use the report button on the content</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Provide detailed information about the violation</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Do not engage in arguments or harassment</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                <Icon icon="mdi:gavel" width="24" height="24" className="text-[#109EB1]" />
                            </div>
                            <h2 className="font-hebden text-2xl font-semibold text-[#109EB1]">
                                Enforcement
                            </h2>
                        </div>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed mb-4">
                            Violations of these guidelines may result in:
                        </p>
                        <ul className="space-y-2 ml-6 mb-4">
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Content removal</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Temporary account suspension</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Permanent account termination</span>
                            </li>
                            <li className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed flex items-start">
                                <span className="text-[#109EB1] mr-2">•</span>
                                <span>Reporting to appropriate authorities for illegal activity</span>
                            </li>
                        </ul>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            The severity of action depends on the nature and frequency of violations. We aim to be fair while maintaining a safe community.
                        </p>
                    </section>

                    <section className="bg-[#109EB1]/10 border border-[#109EB1]/30 rounded-2xl p-6">
                        <h3 className="font-hebden text-xl font-semibold text-[#C7F4FA] mb-3">
                            Questions or Concerns?
                        </h3>
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            If you have questions about these guidelines or need clarification, please reach out through our{' '}
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
                                Discord community
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
                        <Icon icon="mdi:arrow-left" width="20" height="20" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
