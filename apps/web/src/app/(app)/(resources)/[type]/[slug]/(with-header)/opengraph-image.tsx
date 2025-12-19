import { ImageResponse } from 'next/og';
import { getResourceType, getResourceTypeBySingular } from '@/config/resource-types';
import fs from 'fs';
import path from 'path';
import { fetchImageAsBase64Png } from '@/lib/og-image-utils';

export const alt = 'Orbis Resource Preview';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function Image({ params }: { params: { slug: string; type: string } }) {
    const { slug, type } = await params;

    // Fetch resource data
    const data = await fetch(`${API_URL}/resources/slug/${slug}`).then((res) =>
        res.ok ? res.json() : null
    );
    const resource = data?.resource;

    if (!resource) {
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 48,
                        background: '#032125',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#C7F4FA',
                        fontFamily: 'sans-serif',
                    }}
                >
                    Resource Not Found
                </div>
            ),
            { ...size }
        );
    }

    const resourceType = getResourceType(type) || getResourceTypeBySingular(type);
    const typeLabel = resourceType?.labelSingular || 'Resource';

    // Convert icon to PNG for Satori compatibility
    const iconSrc = resource.iconUrl ? await fetchImageAsBase64Png(resource.iconUrl) : null;

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #06363D, #032125)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 60,
                    position: 'relative',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Background Pattern/Glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 600,
                        height: 600,
                        background: 'radial-gradient(circle, rgba(16, 158, 177, 0.2) 0%, transparent 70%)',
                        opacity: 0.5,
                    }}
                />

                {/* Header: Type Badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 40,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            background: 'rgba(16, 158, 177, 0.2)',
                            border: '1px solid rgba(16, 158, 177, 0.3)',
                            borderRadius: 12,
                            padding: '8px 16px',
                            color: '#15C8E0',
                            fontSize: 24,
                            fontWeight: 600,
                        }}
                    >
                        {typeLabel}
                    </div>
                    <div style={{ display: 'flex', color: 'rgba(199, 244, 250, 0.5)', fontSize: 24 }}>
                        by {resource.ownerUser?.username || resource.ownerTeam?.name || 'Unknown'}
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flex: 1 }}>
                    {/* Icon */}
                    {iconSrc && (
                        <img
                            src={iconSrc}
                            alt=""
                            width={200}
                            height={200}
                            style={{
                                borderRadius: 32,
                                border: '4px solid rgba(16, 158, 177, 0.3)',
                            }}
                        />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                        <div
                            style={{
                                fontSize: 64,
                                fontWeight: 800,
                                color: '#C7F4FA',
                                lineHeight: 1.1,
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            }}
                        >
                            {resource.name}
                        </div>
                        <div
                            style={{
                                fontSize: 32,
                                color: 'rgba(199, 244, 250, 0.8)',
                                lineHeight: 1.4,
                                maxWidth: '90%',
                            }}
                        >
                            {resource.tagline || resource.description?.slice(0, 100) + '...'}
                        </div>
                    </div>
                </div>

                {/* Footer: Stats & Branding */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: 'auto',
                    }}
                >
                    <div style={{ display: 'flex', gap: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Download Icon */}
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#15C8E0"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: '#15C8E0' }}>
                                {new Intl.NumberFormat('en-US', { notation: "compact" }).format(resource.downloadCount || 0)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Heart Icon */}
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="#FF5D5D"
                                stroke="#FF5D5D"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: '#FF5D5D' }}>
                                {new Intl.NumberFormat('en-US', { notation: "compact" }).format(resource.likeCount || 0)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <img
                            src={`data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), 'public/icon.png')).toString('base64')}`}
                            alt=""
                            width={48}
                            height={48}
                            style={{
                                borderRadius: 12,
                            }}
                        />
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#C7F4FA' }}>Orbis.place</div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
