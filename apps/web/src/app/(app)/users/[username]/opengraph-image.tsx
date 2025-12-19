import { ImageResponse } from 'next/og';

export const runtime = 'edge';

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
                {user.banner && (
                    <img
                        src={user.banner}
                        alt=""
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
                    {user.image ? (
                        <img
                            src={user.image}
                            alt=""
                            width="200"
                            height="200"
                            style={{
                                borderRadius: 100,
                                border: '6px solid #15C8E0',
                                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                                marginBottom: 40,
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
                                marginBottom: 40,
                            }}
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Name */}
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 900,
                            color: '#C7F4FA',
                            marginBottom: 10,
                            textAlign: 'center',
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        }}
                    >
                        {displayName}
                    </div>

                    {/* Username */}
                    <div
                        style={{
                            fontSize: 32,
                            color: '#15C8E0',
                            marginBottom: 20,
                            textAlign: 'center',
                        }}
                    >
                        @{user.username}
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <div
                            style={{
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ fontSize: 36, fontWeight: 800, color: '#15C8E0' }}>
                                {user._count?.followers || 0}
                            </div>
                            <div style={{ fontSize: 20, color: 'rgba(199, 244, 250, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Followers</div>
                        </div>
                        <div style={{ width: 1, height: 60, background: 'rgba(199, 244, 250, 0.1)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ fontSize: 36, fontWeight: 800, color: '#15C8E0' }}>
                                {user._count?.ownedResources || 0}
                            </div>
                            <div style={{ fontSize: 20, color: 'rgba(199, 244, 250, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Resources</div>
                        </div>
                    </div>
                </div>

                {/* Branding Footer */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 12,
                        opacity: 0.6,
                    }}
                >
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#C7F4FA' }}>Orbis.place</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
