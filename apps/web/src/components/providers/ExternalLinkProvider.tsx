'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { OrbisDialog } from '@/components/OrbisDialog';

interface ExternalLinkContextType {
    openExternalLink: (url: string) => void;
}

const ExternalLinkContext = createContext<ExternalLinkContextType | null>(null);

export function useExternalLink() {
    const context = useContext(ExternalLinkContext);
    if (!context) {
        throw new Error('useExternalLink must be used within an ExternalLinkProvider');
    }
    return context;
}

// Domains that should be treated as internal
const INTERNAL_DOMAINS = [
    'orbis.place',
    'www.orbis.place',
    'localhost',
    '127.0.0.1',
    'www.g-portal.com'
];

function isExternalUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url, window.location.origin);

        // Check if it's a relative URL (same origin)
        if (parsedUrl.origin === window.location.origin) {
            return false;
        }

        // Check if domain is in internal list
        const hostname = parsedUrl.hostname.toLowerCase();
        if (INTERNAL_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
            return false;
        }

        // It's external
        return true;
    } catch {
        // If URL parsing fails, treat as internal
        return false;
    }
}

interface ExternalLinkProviderProps {
    children: React.ReactNode;
}

export function ExternalLinkProvider({ children }: ExternalLinkProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const [displayUrl, setDisplayUrl] = useState<string>('');

    const openExternalLink = useCallback((url: string) => {
        try {
            const parsedUrl = new URL(url);
            setDisplayUrl(parsedUrl.hostname);
        } catch {
            setDisplayUrl(url);
        }
        setPendingUrl(url);
        setIsOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        if (pendingUrl) {
            window.open(pendingUrl, '_blank', 'noopener,noreferrer');
        }
        setIsOpen(false);
        setPendingUrl(null);
    }, [pendingUrl]);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        setPendingUrl(null);
    }, []);

    // Global click handler to intercept external links
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            // Find the closest anchor element
            const target = event.target as HTMLElement;
            const anchor = target.closest('a');

            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Skip if modifier keys are pressed (user wants to open in new tab manually)
            if (event.ctrlKey || event.metaKey || event.shiftKey) return;

            // Skip if it's a download link
            if (anchor.hasAttribute('download')) return;

            // Skip if target is explicitly set to _blank with data-external-allowed
            if (anchor.dataset.externalAllowed === 'true') return;

            // Check if it's an external URL
            if (isExternalUrl(href)) {
                event.preventDefault();
                event.stopPropagation();
                openExternalLink(href);
            }
        };

        // Use capture phase to intercept before other handlers
        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, [openExternalLink]);

    return (
        <ExternalLinkContext.Provider value={{ openExternalLink }}>
            {children}

            <OrbisDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                title="You are leaving Orbis"
                description="You are about to visit an external website. We are not responsible for the content of external sites."
                size="md"
                footer={
                    <>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-border bg-secondary/30 hover:bg-secondary text-foreground transition-all"
                        >
                            Stay on Orbis
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-primary bg-primary hover:bg-primary/90 text-primary-foreground transition-all flex items-center gap-2"
                        >
                            <Icon ssr={true} icon="solar:arrow-right-bold" className="w-4 h-4" />
                            Continue
                        </button>
                    </>
                }
            >
                <div className="bg-secondary/50 border border-border/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground/50 uppercase font-hebden mb-1">Destination</p>
                    <p className="text-sm text-primary font-nunito break-all">{pendingUrl}</p>
                </div>
            </OrbisDialog>
        </ExternalLinkContext.Provider>
    );
}

