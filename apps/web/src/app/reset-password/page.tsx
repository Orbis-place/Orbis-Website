import Link from 'next/link';
import styles from './page.module.css';

export default function ResetPassword() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <svg
              className={styles.lockIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className={styles.title}>Set new password</h1>
          <p className={styles.subtitle}>
            Your new password must be different from previously used passwords
          </p>

          {/* Password Form */}
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={styles.input}
                required
              />
              <p className={styles.hint}>Must be at least 8 characters</p>
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
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Reset Password
            </button>
          </form>

          {/* Back to Login */}
          <Link href="/login" className={styles.backLink}>
            <svg
              className={styles.arrowIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
