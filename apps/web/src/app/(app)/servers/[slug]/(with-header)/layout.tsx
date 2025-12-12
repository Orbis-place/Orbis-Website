import { ReactNode } from 'react';
import ServerLayoutContent from './ServerLayoutContent';

export default function WithHeaderLayout({ children }: { children: ReactNode }) {
    return (
        <ServerLayoutContent>
            {children}
        </ServerLayoutContent>
    );
}
