import { ReactNode } from 'react';
import ResourceLayoutContent from './ResourceLayoutContent';

export default function WithHeaderLayout({ children }: { children: ReactNode }) {
    return (
        <ResourceLayoutContent>
            {children}
        </ResourceLayoutContent>
    );
}
