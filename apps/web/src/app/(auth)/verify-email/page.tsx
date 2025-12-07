'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { authClient } from '@repo/auth/client';
import styles from './page.module.css';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState('');

    const handleResendEmail = async () => {
        setIsResending(true);
        setResendError('');
        setResendSuccess(false);

        try {
            await authClient.sendVerificationEmail({
                email,
                callbackURL: '/dashboard',
            });

            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (error) {
            setResendError('Failed to resend email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const openGmail = () => {
        window.open('https://mail.google.com', '_blank');
    };

    const openOutlook = () => {
        window.open('https://outlook.live.com', '_blank');
    };

    return (
        <div className={styles.page}>
            {/* Background */}
            <div
                className={styles.background}
                style={{
                    backgroundImage: 'url(/login-background.webp)',
                }}
            />
            <div className={styles.gradientOverlay} />

            {/* Logo */}
            <div className={styles.logo}>
                <Image
                    src="/navbar_header.png"
                    alt="Orbis Logo"
                    width={194}
                    height={67}
                    priority
                />
            </div>

            {/* Content Card */}
            <div className={styles.card}>
                <div className={styles.cardContent}>
                    {/* Back to Login */}
                    <div className={styles.backSection}>
                        <a href="/login" className={styles.backLink}>
                            ← Back to Login
                        </a>
                    </div>

                    {/* Icon */}
                    <div className={styles.iconContainer}>
                        <svg
                            className={styles.emailIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>

                    {/* Header */}
                    <h1 className={styles.title}>Verify Your Email</h1>
                    <p className={styles.subtitle}>
                        We've sent a verification link to
                    </p>
                    <p className={styles.email}>{email}</p>

                    <p className={styles.description}>
                        Click the link in the email to verify your account and start your
                        journey in Orbis.
                    </p>

                    {/* Quick Access Buttons */}
                    <div className={styles.quickAccessSection}>
                        <p className={styles.quickAccessLabel}>Quick access to your inbox:</p>
                        <div className={styles.providerButtons}>
                            <button
                                type="button"
                                className={`${styles.providerButton} ${styles.gmailButton}`}
                                onClick={openGmail}
                            >
                                <svg className={styles.providerIcon} viewBox="0 0 24 24">
                                    <path
                                        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Open Gmail
                            </button>

                            <button
                                type="button"
                                className={`${styles.providerButton} ${styles.outlookButton}`}
                                onClick={openOutlook}
                            >
                                <svg className={styles.providerIcon} viewBox="0 0 24 24">
                                    <path
                                        d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"
                                        fill="#0078D4"
                                    />
                                </svg>
                                Open Outlook
                            </button>
                        </div>
                    </div>

                    {/* Resend Section */}
                    <div className={styles.resendSection}>
                        <p className={styles.resendText}>Didn't receive the email?</p>
                        <button
                            type="button"
                            className={styles.resendButton}
                            onClick={handleResendEmail}
                            disabled={isResending}
                        >
                            {isResending ? 'Sending...' : 'Resend Verification Email'}
                        </button>

                        {resendSuccess && (
                            <div className={styles.successMessage}>
                                ✓ Verification email sent successfully!
                            </div>
                        )}

                        {resendError && (
                            <div className={styles.errorMessage}>{resendError}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
