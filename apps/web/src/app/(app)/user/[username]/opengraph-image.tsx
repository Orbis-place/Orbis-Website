import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { fetchImageAsBase64Png } from '@/lib/og-image-utils';

export const alt = 'Orbis User Preview';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function Image({ params }: { params: { username: string } }) {
    const { username } = await params;

    // Fetch user data
    const user = await fetch(`${API_URL}/users/username/${username}`).then((res) =>
        res.ok ? res.json() : null
    );

    if (!user) {
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
                    User Not Found
                </div>
            ),
            { ...size }
        );
    }

    const displayName = user.displayName || user.username;

    // Convert images to PNG for Satori compatibility
    const bannerSrc = user.banner ? await fetchImageAsBase64Png(user.banner) : null;
    const avatarSrc = user.image ? await fetchImageAsBase64Png(user.image) : null;

    return new ImageResponse(
        (
            <div
                style={{
                    background: '#032125',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Banner Background */}
                {bannerSrc && (
                    <img
                        src={bannerSrc}
                        alt=""
                        width={1200}
                        height={630}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.4,
                        }}
                    />
                )}

                {/* Gradient Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom, rgba(3, 33, 37, 0.7), #032125)',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        padding: 60,
                    }}
                >
                    {/* Avatar */}
                    {avatarSrc ? (
                        <img
                            src={avatarSrc}
                            alt=""
                            width={200}
                            height={200}
                            style={{
                                borderRadius: 100,
                                border: '6px solid #15C8E0',

                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 100,
                                background: 'linear-gradient(135deg, #109EB1, #06363D)',
                                border: '6px solid #15C8E0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 80,
                                fontWeight: 800,
                                color: '#C7F4FA',
                            }}
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Name */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 72,
                            fontWeight: 900,
                            color: '#C7F4FA',
                            marginBottom: 64,
                            textAlign: 'center',
                        }}
                    >
                        {displayName}
                    </div>

                    {/* Username */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 32,
                            color: '#15C8E0',
                            marginBottom: 30,
                            textAlign: 'center',
                        }}
                    >
                        @{user.username}
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 32,
                                color: 'rgba(199, 244, 250, 0.8)',
                                textAlign: 'center',
                                maxWidth: 900,
                                marginBottom: 60,
                                lineHeight: 1.4,
                            }}
                        >
                            {user.bio.length > 120 ? user.bio.slice(0, 120) + '...' : user.bio}
                        </div>
                    )}

                    {/* Stats */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 60,
                            background: 'rgba(6, 54, 61, 0.6)',
                            padding: '20px 60px',
                            borderRadius: 100,
                            border: '1px solid rgba(16, 158, 177, 0.3)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Users/Followers Icon */}
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#15C8E0"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: '#15C8E0' }}>
                                {user._count?.followers || 0}
                            </div>
                            <div style={{ display: 'flex', fontSize: 20, color: 'rgba(199, 244, 250, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Followers</div>
                        </div>
                        <div style={{ width: 1, height: 60, background: 'rgba(199, 244, 250, 0.1)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Package/Resources Icon */}
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#15C8E0"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                            <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: '#15C8E0' }}>
                                {user._count?.ownedResources || 0}
                            </div>
                            <div style={{ display: 'flex', fontSize: 20, color: 'rgba(199, 244, 250, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Resources</div>
                        </div>
                    </div>
                </div>

                {/* Branding Footer */}
                <div
                    style={{
                        position: 'absolute',
                        top: 40,
                        right: 60,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
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
        ),
        {
            ...size,
        }
    );
}
