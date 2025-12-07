import { ReactNode } from 'react';
import { ResourceProvider } from '@/contexts/ResourceContext';

export default function ResourceProviderLayout({ children }: { children: ReactNode }) {
    return (
        <ResourceProvider>
            {children}
        </ResourceProvider>
    );
}
