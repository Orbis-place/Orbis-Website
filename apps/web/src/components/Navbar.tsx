import Image from 'next/image';
import Link from 'next/link';

import { LogInIcon } from 'lucide-react';
export default function Navbar() {
  return (
    <nav className="w-full z-100 h-28 relative flex justify-center px-8">
      <div className="flex max-w-7xl justify-between w-full items-center gap-2">
        <Link href="/">
          <Image
            src="/navbar_header.png"
            alt="Orbis Logo"
            width={194}
            height={67.24}
            priority
          />
        </Link>
        <button className="rounded-full flex h-12  bg-primary/80 font-hebden text-base text-white data-active:bg-primary hover:bg-primary transition-all cursor-pointer">
          <span className="w-full flex items-center  gap-2.5 justify-center p-4">
            <LogInIcon size={24} /> Sign In
          </span>
        </button>
      </div>
    </nav>
  );
}
