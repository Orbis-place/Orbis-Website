import { ReactNode } from 'react';
import UserProfileLayout from './UserProfileLayout';
import { generateUserMetadata } from '@/lib/metadata-helpers';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    return generateUserMetadata(username);
}

export default function Layout({ children }: { children: ReactNode }) {
    return <UserProfileLayout>{children}</UserProfileLayout>;
}
