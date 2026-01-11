'use client'

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { authClient } from '@repo/auth/client';
import { toast } from 'sonner';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MAX_API_KEYS = 5;

const settingsSections = [
  { id: 'account', name: 'Account', icon: 'mdi:account' },
  { id: 'privacy', name: 'Privacy', icon: 'mdi:shield-account' },
  { id: 'notifications', name: 'Notifications', icon: 'mdi:bell' },
  { id: 'security', name: 'Security', icon: 'mdi:lock' },
  { id: 'developer', name: 'Developer', icon: 'mdi:code-braces' },
];

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  showFollowers: boolean;
  showFollowing: boolean;
  allowTeamInvitations: boolean;
  // Notification preferences
  notifLikedProjectUpdates: boolean;
  notifNewCreatorUploads: boolean;
  notifNewFollowers: boolean;
  notifVersionStatus: boolean;
  notifCollectionAdditions: boolean;
  notifShowcaseInteractions: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  start: string;
  createdAt: string;
  enabled: boolean;
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

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  // Privacy settings state
  const [showFollowers, setShowFollowers] = useState(true);
  const [showFollowing, setShowFollowing] = useState(true);
  const [allowTeamInvitations, setAllowTeamInvitations] = useState(true);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  // Notification preferences state
  const [notifLikedProjectUpdates, setNotifLikedProjectUpdates] = useState(true);
  const [notifNewCreatorUploads, setNotifNewCreatorUploads] = useState(true);
  const [notifNewFollowers, setNotifNewFollowers] = useState(true);
  const [notifVersionStatus, setNotifVersionStatus] = useState(true);
  const [notifCollectionAdditions, setNotifCollectionAdditions] = useState(true);
  const [notifShowcaseInteractions, setNotifShowcaseInteractions] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch API keys when Developer section is active
  useEffect(() => {
    if (activeSection === 'developer') {
      fetchApiKeys();
    }
  }, [activeSection]);

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
      setShowFollowers(data.showFollowers ?? true);
      setShowFollowing(data.showFollowing ?? true);
      setAllowTeamInvitations(data.allowTeamInvitations ?? true);
      // Initialize notification preferences
      setNotifLikedProjectUpdates(data.notifLikedProjectUpdates ?? true);
      setNotifNewCreatorUploads(data.notifNewCreatorUploads ?? true);
      setNotifNewFollowers(data.notifNewFollowers ?? true);
      setNotifVersionStatus(data.notifVersionStatus ?? true);
      setNotifCollectionAdditions(data.notifCollectionAdditions ?? true);
      setNotifShowcaseInteractions(data.notifShowcaseInteractions ?? true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const { data, error } = await authClient.apiKey.list({});

      if (error) {
        toast.error('Failed to load API keys');
        console.error('Error fetching API keys:', error);
        return;
      }

      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoadingKeys(false);
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

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    // Check if user has reached the limit
    if (apiKeys.length >= MAX_API_KEYS) {
      toast.error(`You can only create up to ${MAX_API_KEYS} API keys`);
      return;
    }

    setIsCreatingKey(true);

    try {
      const { data, error } = await authClient.apiKey.create({
        name: newKeyName.trim(),
      });

      if (error) {
        toast.error(error.message || 'Failed to create API key');
        return;
      }

      if (data) {
        // Store the full key to display it once
        setGeneratedKey(data.key);
        setNewKeyName('');
        toast.success('API key created successfully!');
        // Refresh the list
        await fetchApiKeys();
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const openDeleteDialog = (keyId: string) => {
    setKeyToDelete(keyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteApiKey = async () => {
    if (!keyToDelete) return;

    setDeletingKeyId(keyToDelete);

    try {
      // @ts-expect-error - apiKey plugin is dynamically added
      const { data, error } = await authClient.apiKey.delete({
        keyId: keyToDelete,
      });

      if (error) {
        toast.error(error.message || 'Failed to delete API key');
        return;
      }

      if (data?.success) {
        toast.success('API key deleted successfully');
        // Refresh the list
        await fetchApiKeys();
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setDeletingKeyId(null);
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handlePrivacyUpdate = async (field: 'showFollowers' | 'showFollowing' | 'allowTeamInvitations', value: boolean) => {
    setIsSavingPrivacy(true);

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [field]: value,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update privacy settings');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);

      if (field === 'showFollowers') {
        setShowFollowers(value);
      } else if (field === 'showFollowing') {
        setShowFollowing(value);
      } else {
        setAllowTeamInvitations(value);
      }

      toast.success('Privacy settings updated successfully!');
    } catch (error: any) {
      console.error('Privacy update error:', error);
      toast.error(error.message || 'Failed to update privacy settings');

      // Revert the toggle
      if (field === 'showFollowers') {
        setShowFollowers(!value);
      } else if (field === 'showFollowing') {
        setShowFollowing(!value);
      } else {
        setAllowTeamInvitations(!value);
      }
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const handleNotificationUpdate = async (field: string, value: boolean) => {
    setIsSavingNotifications(true);

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [field]: value,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update notification settings');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);

      // Update the corresponding state
      switch (field) {
        case 'notifLikedProjectUpdates':
          setNotifLikedProjectUpdates(value);
          break;
        case 'notifNewCreatorUploads':
          setNotifNewCreatorUploads(value);
          break;
        case 'notifNewFollowers':
          setNotifNewFollowers(value);
          break;
        case 'notifVersionStatus':
          setNotifVersionStatus(value);
          break;
        case 'notifCollectionAdditions':
          setNotifCollectionAdditions(value);
          break;
        case 'notifShowcaseInteractions':
          setNotifShowcaseInteractions(value);
          break;
      }

      toast.success('Notification settings updated successfully!');
    } catch (error: any) {
      console.error('Notification update error:', error);
      toast.error(error.message || 'Failed to update notification settings');
    } finally {
      setIsSavingNotifications(false);
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

          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-2 text-foreground">
                  Profile Visibility
                </h2>
                <p className="text-sm text-muted-foreground font-nunito mb-4">
                  Control who can see your social connections
                </p>

                <div className="space-y-4">
                  {/* Followers Visibility */}
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:account-group" width="20" height="20" className="text-primary" />
                        <h3 className="font-hebden font-medium text-foreground">
                          Public Followers List
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Allow others to see who follows you
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyUpdate('showFollowers', !showFollowers)}
                      disabled={isSavingPrivacy}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        showFollowers ? 'bg-primary' : 'bg-muted',
                        isSavingPrivacy && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          showFollowers ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  {/* Following Visibility */}
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:account-multiple" width="20" height="20" className="text-primary" />
                        <h3 className="font-hebden font-medium text-foreground">
                          Public Following List
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Allow others to see who you follow
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyUpdate('showFollowing', !showFollowing)}
                      disabled={isSavingPrivacy}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        showFollowing ? 'bg-primary' : 'bg-muted',
                        isSavingPrivacy && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          showFollowing ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  {/* Team Invitations */}
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:account-multiple-plus" width="20" height="20" className="text-primary" />
                        <h3 className="font-hebden font-medium text-foreground">
                          Allow Team Invitations
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Allow others to invite you to join their teams
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyUpdate('allowTeamInvitations', !allowTeamInvitations)}
                      disabled={isSavingPrivacy}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        allowTeamInvitations ? 'bg-primary' : 'bg-muted',
                        isSavingPrivacy && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          allowTeamInvitations ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-2 text-foreground">
                  Notification Preferences
                </h2>
                <p className="text-sm text-muted-foreground font-nunito mb-4">
                  Choose which notifications you want to receive
                </p>

                <div className="space-y-6">
                  {/* Social Notifications */}
                  <div>
                    <h3 className="font-hebden text-md font-medium mb-3 text-foreground flex items-center gap-2">
                      <Icon icon="mdi:account-group" width="20" height="20" className="text-primary" />
                      Social
                    </h3>
                    <div className="space-y-3 ml-7">
                      {/* New Followers */}
                      <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex-1">
                          <h4 className="font-hebden font-medium text-foreground text-sm">
                            New Followers
                          </h4>
                          <p className="text-xs text-muted-foreground font-nunito">
                            When someone starts following you
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('notifNewFollowers', !notifNewFollowers)}
                          disabled={isSavingNotifications}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            notifNewFollowers ? 'bg-primary' : 'bg-muted',
                            isSavingNotifications && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              notifNewFollowers ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>

                      {/* New Creator Uploads */}
                      <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex-1">
                          <h4 className="font-hebden font-medium text-foreground text-sm">
                            New Creator Uploads
                          </h4>
                          <p className="text-xs text-muted-foreground font-nunito">
                            When creators you follow publish new resources
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('notifNewCreatorUploads', !notifNewCreatorUploads)}
                          disabled={isSavingNotifications}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            notifNewCreatorUploads ? 'bg-primary' : 'bg-muted',
                            isSavingNotifications && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              notifNewCreatorUploads ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Resource Notifications */}
                  <div>
                    <h3 className="font-hebden text-md font-medium mb-3 text-foreground flex items-center gap-2">
                      <Icon icon="mdi:package-variant" width="20" height="20" className="text-primary" />
                      Resources
                    </h3>
                    <div className="space-y-3 ml-7">
                      {/* Liked Project Updates */}
                      <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex-1">
                          <h4 className="font-hebden font-medium text-foreground text-sm">
                            Liked Project Updates
                          </h4>
                          <p className="text-xs text-muted-foreground font-nunito">
                            When resources you've liked receive updates
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('notifLikedProjectUpdates', !notifLikedProjectUpdates)}
                          disabled={isSavingNotifications}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            notifLikedProjectUpdates ? 'bg-primary' : 'bg-muted',
                            isSavingNotifications && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              notifLikedProjectUpdates ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>

                      {/* Version Approvals */}
                      <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex-1">
                          <h4 className="font-hebden font-medium text-foreground text-sm">
                            Version Approvals
                          </h4>
                          <p className="text-xs text-muted-foreground font-nunito">
                            When your resource versions are approved or rejected
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('notifVersionStatus', !notifVersionStatus)}
                          disabled={isSavingNotifications}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            notifVersionStatus ? 'bg-primary' : 'bg-muted',
                            isSavingNotifications && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              notifVersionStatus ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>

                      {/* Collection Additions */}
                      <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex-1">
                          <h4 className="font-hebden font-medium text-foreground text-sm">
                            Collection Additions
                          </h4>
                          <p className="text-xs text-muted-foreground font-nunito">
                            When your resources are added to public collections
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('notifCollectionAdditions', !notifCollectionAdditions)}
                          disabled={isSavingNotifications}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            notifCollectionAdditions ? 'bg-primary' : 'bg-muted',
                            isSavingNotifications && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              notifCollectionAdditions ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Showcase Notifications */}
                  <div>
                    <h3 className="font-hebden text-md font-medium mb-3 text-foreground flex items-center gap-2">
                      <Icon icon="mdi:image-multiple" width="20" height="20" className="text-primary" />
                      Showcase
                    </h3>
                    <div className="space-y-3 ml-7">
                      {/* Showcase Interactions */}
                      <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex-1">
                          <h4 className="font-hebden font-medium text-foreground text-sm">
                            Showcase Interactions
                          </h4>
                          <p className="text-xs text-muted-foreground font-nunito">
                            When someone likes or comments on your showcase posts
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('notifShowcaseInteractions', !notifShowcaseInteractions)}
                          disabled={isSavingNotifications}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            notifShowcaseInteractions ? 'bg-primary' : 'bg-muted',
                            isSavingNotifications && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              notifShowcaseInteractions ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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

          {activeSection === 'developer' && (
            <div className="space-y-6">
              {/* Create API Key */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-2 text-foreground">
                  Create API Key
                </h2>
                <p className="text-sm text-muted-foreground font-nunito mb-4">
                  Generate an API key to authenticate your applications.
                </p>

                <form onSubmit={handleCreateApiKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">API Key Name</Label>
                    <Input
                      id="keyName"
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      disabled={isCreatingKey}
                      placeholder="My Application API Key"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      A descriptive name to identify this key
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isCreatingKey || apiKeys.length >= MAX_API_KEYS}
                    className="font-hebden"
                  >
                    {isCreatingKey ? (
                      <>
                        <Icon icon="mdi:loading" className="animate-spin mr-2" width="16" height="16" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:key-plus" className="mr-2" width="16" height="16" />
                        Create API Key
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Generated Key Display */}
              {generatedKey && (
                <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary rounded-lg p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Icon icon="mdi:key-variant" className="text-primary" width="24" height="24" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-hebden text-xl font-bold text-foreground mb-1">
                          Your API Key is Ready!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Copy and save this key now - it will only be shown once and cannot be recovered later.
                        </p>
                      </div>
                    </div>

                    <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          API Key
                        </Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generatedKey)}
                          className="h-7 gap-1.5 font-hebden"
                        >
                          <Icon icon="mdi:content-copy" width="14" height="14" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-secondary/50 rounded p-3 font-mono text-sm break-all select-all text-foreground">
                        {generatedKey}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <Icon icon="mdi:alert-circle" className="text-yellow-500 flex-shrink-0" width="18" height="18" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-yellow-500 font-semibold">Important:</strong> Store this key in a secure location.
                        Once you close this message, you won't be able to see the full key again.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => copyToClipboard(generatedKey)}
                        className="font-hebden flex-1"
                      >
                        <Icon icon="mdi:content-copy" className="mr-2" width="16" height="16" />
                        Copy to Clipboard
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setGeneratedKey(null)}
                        className="font-hebden"
                      >
                        <Icon icon="mdi:check" className="mr-2" width="16" height="16" />
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              )}



              {/* API Keys List */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">
                  Your API Keys ({apiKeys.length}/{MAX_API_KEYS})
                </h2>

                {isLoadingKeys ? (
                  <div className="flex items-center justify-center py-8">
                    <Icon icon="mdi:loading" className="animate-spin text-primary" width="24" height="24" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon icon="mdi:key-outline" className="mx-auto text-muted-foreground mb-2" width="48" height="48" />
                    <p className="text-muted-foreground font-nunito">
                      No API keys yet. Create one to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-hebden font-medium text-foreground truncate">
                              {key.name}
                            </h3>
                            {!key.enabled && (
                              <span className="px-2 py-0.5 text-xs bg-destructive/20 text-destructive rounded">
                                Disabled
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-nunito">
                            <span className="font-mono">{key.start}...</span>
                            <span>•</span>
                            <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-xs">100 req/hour</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteDialog(key.id)}
                          disabled={deletingKeyId === key.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-4"
                        >
                          {deletingKeyId === key.id ? (
                            <Icon icon="mdi:loading" className="animate-spin" width="16" height="16" />
                          ) : (
                            <Icon icon="mdi:delete" width="16" height="16" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* API Usage Documentation */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-2 text-foreground">
                  How to Use Your API Key
                </h2>
                <p className="text-sm text-muted-foreground font-nunito mb-4">
                  Include your API key in the request header to authenticate your requests.
                </p>

                <div className="space-y-4">
                  {/* Endpoint Info */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Icon icon="mdi:api" width="16" height="16" />
                      API Base URL
                    </Label>
                    <div className="bg-background border border-border rounded-lg p-3">
                      <code className="text-sm font-mono text-primary">
                        https://api.orbis.place
                      </code>
                    </div>
                  </div>

                  {/* Example Request */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Icon icon="mdi:code-braces" width="16" height="16" />
                      Example Request
                    </Label>
                    <div className="bg-background border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          cURL
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(
                            `curl -X GET https://api.orbis.place/resources/me \\\n  -H "x-api-key: YOUR_API_KEY"`
                          )}
                          className="h-6 gap-1.5 text-xs"
                        >
                          <Icon icon="mdi:content-copy" width="12" height="12" />
                          Copy
                        </Button>
                      </div>
                      <div className="p-4 overflow-x-auto">
                        <pre className="text-xs font-mono text-foreground">
                          <code>{`curl -X GET https://api.orbis.place/resources/me \\
  -H "x-api-key: YOUR_API_KEY"`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Rate Limiting Info */}
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <Icon icon="mdi:information" className="text-blue-500 flex-shrink-0 mt-0.5" width="18" height="18" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-500 mb-1">Rate Limiting</p>
                      <p className="text-xs text-muted-foreground">
                        Each API key is limited to <strong>100 requests per hour</strong>.
                        If you exceed this limit, you'll receive a 429 (Too Many Requests) response.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Confirmation Dialog */}
              <OrbisConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete API Key"
                description="Are you sure you want to delete this API key? This action cannot be undone."
                onConfirm={handleDeleteApiKey}
                onCancel={() => {
                  setDeleteDialogOpen(false);
                  setKeyToDelete(null);
                }}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                confirmLoading={deletingKeyId !== null}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
