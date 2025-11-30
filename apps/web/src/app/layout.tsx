import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Nunito } from 'next/font/google';
import Navbar from '../components/Navbar';
import './globals.css';

const hebden = localFont({
  src: '../fonts/Hebden.woff2',
  variable: '--font-hebden',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Orbis - Coming Soon',
  description: 'Something amazing is coming. Stay tuned!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hebden.variable} ${nunito.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
