import { ReactNode } from 'react';
import { ServerProvider } from '@/contexts/ServerContext';

export default function ServerLayout({ children }: { children: ReactNode }) {
    return (
        <ServerProvider>
            {children}
        </ServerProvider>
    );
}
