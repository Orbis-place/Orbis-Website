import Image from 'next/image';
import styles from './page.module.css';

import Link from 'next/link';
import { Rotater } from '@/components/home/Rotater';

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
                className="text-3xl h-6 sm:h-[30px] md:h-[48px]"
                names={[
                  'Server Hub',
                  'Marketplace',
                  'Plugin Repository',
                  'Community Website',
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

            <button className="flex items-center justify-center px-[18px] py-[14px] md:py-[16px] gap-2.5 bg-[rgba(152,234,245,0.25)] border-2 border-[rgba(152,234,245,0.25)] rounded-full w-full sm:w-auto sm:min-w-[198px] h-[48px] md:h-[52px] hover:bg-[rgba(152,234,245,0.35)] transition-all cursor-pointer">
              <span className="font-hebden font-semibold text-base md:text-[17px] leading-[20px] text-[#C7F4FA]">
                Browse Content
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-row items-center px-4 md:px-[18px] py-3 md:py-3.5 gap-2.5 w-full h-[48px] md:h-[52px] bg-[#06363D] border border-[#084B54] rounded-[84px]">
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
              filter:
                'drop-shadow(0 0 15px rgba(199, 244, 250, 0.3)) drop-shadow(0 0 30px rgba(21, 200, 224, 0.2))',
            }}
            className="object-contain drop-shadow-2xl md:w-[400px] md:h-[400px] w-[250px] h-[250px]"
            priority
          />
        </div>
      </section>

      {/* For Players Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>For Players</h2>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🎮</span>
              <h3 className={styles.featureTitle}>
                Discover thousands of creations
              </h3>
              <p className={styles.featureText}>
                From magical biomes to cursed dungeons, you can be sure to find
                content to bring your gameplay to the next level.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>⚡</span>
              <h3 className={styles.featureTitle}>
                Find what you want, quickly and easily
              </h3>
              <p className={styles.featureText}>
                Orbis&apos;s lightning-fast search and powerful filters let you
                find what you want as you type.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔔</span>
              <h3 className={styles.featureTitle}>Follow projects you love</h3>
              <p className={styles.featureText}>
                Get notified every time your favorite projects update and stay
                in the loop.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🚀</span>
              <h3 className={styles.featureTitle}>
                Play with your favorite launcher
              </h3>
              <p className={styles.featureText}>
                Orbis&apos;s open-source API lets launchers add deep
                integration. Use Orbis through our own app and popular
                launchers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>For Creators</h2>

          <div className={styles.creatorHero}>
            <div className={styles.creatorContent}>
              <h3 className={styles.creatorTitle}>
                Share your content with the world
              </h3>
              <p className={styles.creatorText}>
                Give an online home to your creations and reach a massive
                audience of dedicated players.
              </p>
            </div>
          </div>

          <div className={styles.creatorFeatures}>
            <div className={styles.creatorFeature}>
              <h4 className={styles.creatorFeatureTitle}>Discovery</h4>
              <p className={styles.creatorFeatureText}>
                Get your project discovered by thousands of users through
                search, our home page, Discord server, and more.
              </p>
            </div>

            <div className={styles.creatorFeature}>
              <h4 className={styles.creatorFeatureTitle}>Team Management</h4>
              <p className={styles.creatorFeatureText}>
                Invite your teammates and manage roles and permissions with
                ease.
              </p>
            </div>

            <div className={styles.creatorFeature}>
              <h4 className={styles.creatorFeatureTitle}>Monetization</h4>
              <p className={styles.creatorFeatureText}>
                Get paid ad revenue from your project pages and withdraw your
                funds at any time.
              </p>
            </div>

            <div className={styles.creatorFeature}>
              <h4 className={styles.creatorFeatureTitle}>Diverse Ecosystem</h4>
              <p className={styles.creatorFeatureText}>
                Integrate with your build tools for automatic uploads right when
                you release a new version.
              </p>
            </div>

            <div className={styles.creatorFeature}>
              <h4 className={styles.creatorFeatureTitle}>
                Data and Statistics
              </h4>
              <p className={styles.creatorFeatureText}>
                Get detailed reports on page views, download counts, and
                revenue.
              </p>
            </div>

            <div className={styles.creatorFeature}>
              <h4 className={styles.creatorFeatureTitle}>
                Constantly Evolving
              </h4>
              <p className={styles.creatorFeatureText}>
                Get the best experience possible with constant updates from the
                Orbis team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Launch Notice */}
      <section className={styles.launchSection}>
        <div className={styles.container}>
          <p className={styles.launchMessage}>Launching with Hytale 🚀</p>
          <div className={styles.socials}>
            <a
              href="https://discord.gg/VUEAVDh4H7"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Join our Discord"
            >
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Discord
            </a>
            <a
              href="https://x.com/OrbisPlace"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Follow us on X"
            >
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
