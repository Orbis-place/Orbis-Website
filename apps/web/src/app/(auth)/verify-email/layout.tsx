import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Verify Email',
    description: 'Verify your email address to complete your Orbis account registration.',
    robots: {
        index: false,
        follow: true,
    },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
