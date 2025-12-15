'use client';

import { useState, useEffect } from 'react';
import { fetchHytaleVersions } from '@/lib/api/resources';

interface VersionFilterProps {
    selectedVersions: string[];
    onVersionsChange: (versions: string[]) => void;
}

export function VersionFilter({ selectedVersions, onVersionsChange }: VersionFilterProps) {
    const [versions, setVersions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVersions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const hytaleVersions = await fetchHytaleVersions();
                setVersions(hytaleVersions);
            } catch (err) {
                console.error('Failed to fetch Hytale versions:', err);
                setError(err instanceof Error ? err.message : 'Failed to load versions');
                setVersions([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadVersions();
    }, []);

    const toggleVersion = (version: string) => {
        if (selectedVersions.includes(version)) {
            onVersionsChange(selectedVersions.filter((v) => v !== version));
        } else {
            onVersionsChange([...selectedVersions, version]);
        }
    };

    return (
        <div className="flex flex-col gap-2.5">
            {isLoading ? (
                <div className="text-sm text-[#C7F4FA]/40 py-2 font-abeezee">Loading versions...</div>
            ) : error ? (
                <div className="text-sm text-red-400 py-2 font-abeezee">{error}</div>
            ) : !versions || versions.length === 0 ? (
                <div className="text-sm text-[#C7F4FA]/40 py-2 font-abeezee">No versions found</div>
            ) : (
                versions.map((version) => (
                    <button
                        key={version}
                        onClick={() => toggleVersion(version)}
                        className={`flex items-center px-[15px] py-2.5 rounded-full transition-all ${selectedVersions.includes(version)
                            ? 'bg-[#032125] text-[#109EB1]'
                            : 'bg-transparent text-[#C7F4FA] hover:bg-[#032125]/50'
                            }`}
                    >
                        <span className="font-abeezee text-[15.16px] leading-[18px]">{version}</span>
                    </button>
                ))
            )}
        </div>
    );
}
