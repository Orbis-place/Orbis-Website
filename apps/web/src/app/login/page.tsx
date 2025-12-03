'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { authClient } from '@repo/auth/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogInIcon } from 'lucide-react';

const randomLoginText = [
  'Your journey awaits, cursebreaker!',
  "A cursebreaker's work is never done.",
  'Find your next adventure today, cursebreaker.',
  "A cursebreaker's path is filled with challenges.",
  'Unlock the secrets of Orbis, cursebreaker.',
  "A cursebreaker's tale never ends.",
  'Another day, another quest, cursebreaker.',
  'The world of Orbis beckons, cursebreaker.',
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Randomized login text, just to add character :)
  const [text, setText] = useState(() => '');
  useEffect(() => {
    setText(
      randomLoginText[Math.floor(Math.random() * randomLoginText.length)] + '',
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
  };

  const handleSocialSignIn = async (provider: 'discord' | 'google') => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/dashboard/profile`,
      });
    } catch (err) {
      setError('Social sign-in failed');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className="before:absolute before:-inset-1 before:bg-linear-to-br pt-8 before:from-background/90 before:to-secondary/90 before:rounded-2xl relative border-4 border-muted/60  rounded-2xl p-4">
          <div className="z-10 relative">
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>{text}</p>

            {error && <div className={styles.error}>{error}</div>}

            <div className="flex items-center justify-between flex-wrap ">
              <Button
                type="button"
                size={'lg'}
                className="bg-[#5865F2] items-center flex gap-2 w-fit hover:bg-unset font-sans font-semibold"
                onClick={() => handleSocialSignIn('discord')}
                disabled={isLoading}
              >
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span className="h-4.5">Continue with Discord</span>
              </Button>

              <Button
                type="button"
                size={'lg'}
                className="bg-gray-200 items-center flex gap-2 w-fit text-black hover:bg-unset font-sans font-semibold"
                onClick={() => handleSocialSignIn('google')}
                disabled={isLoading}
              >
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="h-4.5">Continue with Google</span>
              </Button>
            </div>

            <div className="my-2 flex items-center gap-2">
              <span className={'flex-1 h-px bg-primary/20'}></span>
              <span className={'text-foreground/60'}>or</span>
              <span className={'flex-1 h-px bg-primary/20'}></span>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <Label htmlFor="email" className={''}>
                  Email
                </Label>
                <Input
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  type="email"
                />
              </div>

              <div className={styles.inputGroup}>
                <Label htmlFor="password" className={''}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  className="placeholder:text-secondary-foreground/50 "
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-between w-full items-center">
                <Label className="flex items-center text-base font-normal cursor-pointer gap-2 font-nunito">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                    disabled={isLoading}
                  />
                  Remember me
                </Label>
                <Link
                  href="/forgot-password"
                  className={
                    'hover-underline relative group before:bg-linear-to-r hover:before:scale-100 hover:before:origin-left before:from-primary before:to-secondary-foreground'
                  }
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                size={'lg'}
                className="text-lg font-nunito font-bold py-6 hover:-translate-y-0.5 transition-all duration-300 button-hover overflow-visible hover:shadow-[0_4px_12px_rgba(16,158,177,0.3)]"
                disabled={isLoading}
              >
                <LogInIcon />
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className={styles.switchText}>
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className={
                  'text-secondary-foreground! hover-underline relative group before:bg-linear-to-r hover:before:scale-100 hover:before:origin-left before:from-primary before:to-secondary-foreground'
                }
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
