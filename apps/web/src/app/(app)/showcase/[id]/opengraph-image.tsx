import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { fetchImageAsBase64Png } from '@/lib/og-image-utils';

export const alt = 'Orbis Showcase Preview';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
    'THREE_D_MODEL': '#FF6B35',
    'SCREENSHOT': '#4ECDC4',
    'VIDEO': '#FF3366',
    'ARTWORK': '#9B59B6',
    'ANIMATION': '#E74C3C',
    'CONCEPT_ART': '#3498DB',
    'FAN_ART': '#E91E63',
    'TUTORIAL': '#2ECC71',
    'DEVLOG': '#F39C12',
    'OTHER': '#95A5A6',
};

const CATEGORY_LABELS: Record<string, string> = {
    'THREE_D_MODEL': '3D Model',
    'SCREENSHOT': 'Screenshot',
    'VIDEO': 'Video',
    'ARTWORK': 'Artwork',
    'ANIMATION': 'Animation',
    'CONCEPT_ART': 'Concept Art',
    'FAN_ART': 'Fan Art',
    'TUTORIAL': 'Tutorial',
    'DEVLOG': 'Dev Log',
    'OTHER': 'Other',
};

export default async function Image({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Fetch showcase post data
    const response = await fetch(`${API_URL}/showcase/${id}`);
    const post = response.ok ? await response.json() : null;

    if (!post) {
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
                    Showcase Not Found
                </div>
            ),
            { ...size }
        );
    }

    const categoryColor = CATEGORY_COLORS[post.category] || '#109EB1';
    const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
    const ownerName = post.ownerTeam?.name || post.author?.displayName || post.author?.username || 'Unknown';

    // Get thumbnail from first media item
    const thumbnailSrc = post.media?.[0]?.url ? await fetchImageAsBase64Png(post.media[0].url) : null;

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #06363D, #032125)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 50,
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
                        background: `radial-gradient(circle, ${categoryColor}33 0%, transparent 70%)`,
                        opacity: 0.5,
                    }}
                />

                {/* Header: Category Badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 30,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            background: categoryColor,
                            borderRadius: 12,
                            padding: '8px 16px',
                            color: '#032125',
                            fontSize: 24,
                            fontWeight: 700,
                        }}
                    >
                        {categoryLabel}
                    </div>
                    <div style={{ display: 'flex', color: 'rgba(199, 244, 250, 0.5)', fontSize: 24 }}>
                        by {ownerName}
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flex: 1 }}>
                    {/* Thumbnail - Bigger */}
                    {thumbnailSrc && (
                        <img
                            src={thumbnailSrc}
                            alt=""
                            width={400}
                            height={260}
                            style={{
                                borderRadius: 20,
                                objectFit: 'cover',
                                border: `4px solid ${categoryColor}50`,
                                flexShrink: 0,
                            }}
                        />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 52,
                                fontWeight: 800,
                                color: '#C7F4FA',
                                lineHeight: 1.1,
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            }}
                        >
                            {post.title}
                        </div>
                        {post.description && (
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: 26,
                                    color: 'rgba(199, 244, 250, 0.7)',
                                    lineHeight: 1.4,
                                    maxWidth: '100%',
                                }}
                            >
                                {post.description?.replace(/<[^>]*>/g, '').slice(0, 200)}{post.description?.replace(/<[^>]*>/g, '').length > 200 ? '...' : ''}
                            </div>
                        )}
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
                            {/* Eye Icon */}
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
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: '#15C8E0' }}>
                                {new Intl.NumberFormat('en-US', { notation: "compact" }).format(post.viewCount || 0)}
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
                                {new Intl.NumberFormat('en-US', { notation: "compact" }).format(post._count?.likes || 0)}
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
