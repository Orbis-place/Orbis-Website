'use client'

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { authClient } from '@repo/auth/client';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const settingsSections = [
  { id: 'account', name: 'Account', icon: 'mdi:account' },
  // { id: 'notifications', name: 'Notifications', icon: 'mdi:bell' },
  // { id: 'privacy', name: 'Privacy', icon: 'mdi:shield-account' },
  { id: 'security', name: 'Security', icon: 'mdi:lock' },
];

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Account settings state
  const [username, setUsername] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data);
      setUsername(data.username || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    if (username.length > 30) {
      toast.error('Username must be at most 30 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, underscores and hyphens');
      return;
    }

    // If username hasn't changed, don't make request
    if (username === user?.username) {
      toast.info('No changes to save');
      return;
    }

    setIsSavingAccount(true);

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle specific error for duplicate username
        if (response.status === 409 || error.message?.toLowerCase().includes('username') && error.message?.toLowerCase().includes('already')) {
          toast.error('This username is already taken. Please choose another one.');
          return;
        }

        throw new Error(error.message || 'Failed to update account');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setUsername(updatedUser.username);
      toast.success('Account updated successfully!');
    } catch (error: any) {
      console.error('Account update error:', error);
      toast.error(error.message || 'Failed to update account');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { data, error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        toast.error(error.message || 'Failed to change password');
        return;
      }

      if (data) {
        toast.success('Password changed successfully!');
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-hebden text-3xl font-bold text-foreground">Settings</h1>
        <div className="flex items-center justify-center py-12">
          <Icon icon="mdi:loading" className="animate-spin text-primary" width="32" height="32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-hebden text-3xl font-bold text-foreground">Settings</h1>

      <div className="flex flex-col gap-6">
        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-nunito whitespace-nowrap',
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon icon={section.icon} width="18" height="18" />
              {section.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div>
          {activeSection === 'account' && (
            <div className="space-y-6">
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">
                  Account Settings
                </h2>

                <form onSubmit={handleAccountUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isSavingAccount}
                      placeholder="username"
                      minLength={3}
                      maxLength={30}
                      pattern="[a-zA-Z0-9_-]+"
                    />
                    <p className="text-xs text-muted-foreground">
                      3-30 characters. Letters, numbers, underscores and hyphens only.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSavingAccount || username === user?.username}
                    className="font-hebden"
                  >
                    {isSavingAccount ? (
                      <>
                        <Icon icon="mdi:loading" className="animate-spin mr-2" width="16" height="16" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </form>
              </div>

              <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-2 text-destructive">
                  Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground font-nunito mb-4">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" className="font-hebden" disabled>
                  Delete Account
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">
                  Change Password
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isChangingPassword}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isChangingPassword}
                    />
                    <p className="text-xs text-muted-foreground">
                      At least 8 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isChangingPassword}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="font-hebden"
                  >
                    {isChangingPassword ? (
                      <>
                        <Icon icon="mdi:loading" className="animate-spin mr-2" width="16" height="16" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
