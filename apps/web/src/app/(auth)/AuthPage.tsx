'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './login/page.module.css';
import { authClient } from '@repo/auth/client';

export default function AuthPage() {
    const pathname = usePathname();
    const router = useRouter();
    const isSignup = pathname === '/signup';

    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Signup state
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Common state
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset error when switching modes
    useEffect(() => {
        setError('');
    }, [isSignup]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isSignup) {
            // Signup validation
            if (!termsAccepted) {
                setError('You must accept the Terms of Service and Privacy Policy');
                return;
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters long');
                return;
            }

            setIsLoading(true);

            try {
                const { data, error } = await authClient.signUp.email({
                    email,
                    password,
                    name: username,
                });

                if (error) {
                    setError(error.message || 'An error occurred');
                    setIsLoading(false);
                    return;
                }

                if (data) {
                    router.push('/dashboard');
                    router.refresh();
                }
            } catch (err) {
                setError('An unexpected error occurred');
                setIsLoading(false);
            }
        } else {
            // Login
            setIsLoading(true);

            try {
                const { data, error } = await authClient.signIn.email({
                    email,
                    password,
                    rememberMe,
                });

                if (error) {
                    setError(error.message || 'An error occurred');
                    setIsLoading(false);
                    return;
                }

                if (data) {
                    router.push('/dashboard/profile');
                    router.refresh();
                }
            } catch (err) {
                setError('An unexpected error occurred');
                setIsLoading(false);
            }
        }
    };

    const handleSocialSignIn = async (provider: 'discord' | 'google') => {
        setIsLoading(true);
        try {
            await authClient.signIn.social({
                provider,
                callbackURL: `${window.location.origin}/dashboard${isSignup ? '' : '/profile'}`,
            });
        } catch (err) {
            setError('Social sign-in failed');
            setIsLoading(false);
        }
    };

    const switchMode = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const newPath = isSignup ? '/login' : '/signup';
        window.history.replaceState(null, '', newPath);
        router.replace(newPath);
    };

    return (
        <div className={`${styles.page}`}>
            {/* Animated Background Layers */}
            <motion.div
                className={styles.backgroundLayer}
                style={{
                    backgroundImage: 'url(/login-background.webp)',
                }}
                initial={false}
                animate={{ opacity: isSignup ? 0 : 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
            <motion.div
                className={styles.backgroundLayer}
                style={{
                    backgroundImage: 'url(/signup-background.webp)',
                }}
                initial={false}
                animate={{ opacity: isSignup ? 1 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {/* Gradient Overlay */}
            <motion.div
                className={styles.gradientOverlay}
                initial={false}
                animate={{
                    background: isSignup
                        ? 'linear-gradient(90deg, rgba(3, 33, 37, 0.7) 0%, rgba(3, 33, 37, 0) 100%)'
                        : 'linear-gradient(90deg, rgba(3, 33, 37, 0) 0%, rgba(3, 33, 37, 0.7) 100%)',
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {/* Logo */}
            <motion.div
                className={`${styles.logo} ${isSignup ? styles.logoLeft : styles.logoRight}`}
                initial={false}
                animate={{
                    left: isSignup ? '200px' : 'auto',
                    right: isSignup ? 'auto' : '200px',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <Image
                    src="/navbar_header.png"
                    alt="Orbis Logo"
                    width={194}
                    height={67}
                    priority
                />
            </motion.div>

            {/* Auth Card */}
            <motion.div
                className={styles.card}
                initial={false}
                animate={{
                    left: isSignup ? 'auto' : '56px',
                    right: isSignup ? '56px' : 'auto',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <div className={styles.cardContent}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>
                            {isSignup ? 'Welcome to Orbis' : 'Welcome Back!'}
                        </h1>
                        <p className={styles.subtitle}>
                            {isSignup
                                ? 'Enter the space where every vision finds its form.'
                                : 'A cursebreaker\'s path is filled with challenges.'}
                        </p>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    {/* Social Buttons */}
                    <div className={styles.socialButtons}>
                        <button
                            type="button"
                            className={styles.socialButton}
                            onClick={() => handleSocialSignIn('discord')}
                            disabled={isLoading}
                        >
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            Continue with Discord
                        </button>

                        <button
                            type="button"
                            className={styles.socialButton}
                            onClick={() => handleSocialSignIn('google')}
                            disabled={isLoading}
                        >
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <span className={styles.dividerLine}></span>
                        <span className={styles.dividerText}>or</span>
                        <span className={styles.dividerLine}></span>
                    </div>

                    {/* Form */}
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {isSignup && (
                            <div className={styles.inputGroup}>
                                <label htmlFor="username" className={styles.label}>
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Kweebec123"
                                    className={styles.input}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="youremail@example.com"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {isSignup ? (
                            <div className={styles.passwordRow}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="password" className={styles.label}>
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className={styles.input}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="confirmPassword" className={styles.label}>
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        className={styles.input}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={styles.inputGroup}>
                                <label htmlFor="password" className={styles.label}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {isSignup ? (
                            <div className={styles.termsGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        required
                                        disabled={isLoading}
                                    />
                                    I agree to the{' '}
                                    <Link href="/terms" className={styles.link}>
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className={styles.link}>
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                        ) : (
                            <div className={styles.formFooter}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={isLoading}
                                    />
                                    Remember me
                                </label>
                                <Link href="/forgot-password" className={styles.forgotLink}>
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        <button type="submit" className={styles.submitButton} disabled={isLoading}>
                            {isLoading
                                ? isSignup
                                    ? 'Creating account...'
                                    : 'Signing in...'
                                : isSignup
                                    ? 'Create An Account'
                                    : 'Sign In'}
                        </button>
                    </form>

                    {/* Switch Mode */}
                    <p className={styles.switchText}>
                        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                        <a
                            href={isSignup ? '/login' : '/signup'}
                            className={styles.switchLink}
                            onClick={switchMode}
                        >
                            {isSignup ? 'Log In' : 'Sign Up'}
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
