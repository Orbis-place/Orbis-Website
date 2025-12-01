'use client'

import { useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const settingsSections = [
  { id: 'account', name: 'Account', icon: 'mdi:account' },
  { id: 'profile', name: 'Profile', icon: 'mdi:account-edit' },
  { id: 'notifications', name: 'Notifications', icon: 'mdi:bell' },
  { id: 'privacy', name: 'Privacy', icon: 'mdi:shield-account' },
  { id: 'security', name: 'Security', icon: 'mdi:lock' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');

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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-nunito text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-nunito text-foreground mb-2">Username</label>
                      <input
                        type="text"
                        placeholder="username"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-nunito text-foreground mb-2">Language</label>
                      <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>English</option>
                        <option>Français</option>
                        <option>Español</option>
                        <option>Deutsch</option>
                      </select>
                    </div>

                    <Button className="font-hebden">Save Changes</Button>
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6">
                  <h2 className="font-hebden text-xl font-semibold mb-2 text-destructive">
                    Danger Zone
                  </h2>
                  <p className="text-sm text-muted-foreground font-nunito mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button variant="destructive" className="font-hebden">
                    Delete Account
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">
                  Profile Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-nunito text-foreground mb-2">Display Name</label>
                    <input
                      type="text"
                      placeholder="Your display name"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-nunito text-foreground mb-2">Bio</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-nunito text-foreground mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-nunito text-foreground mb-2">Website</label>
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button className="font-hebden">Save Changes</Button>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    { name: 'Email Notifications', description: 'Receive notifications via email' },
                    { name: 'Resource Updates', description: 'Get notified about updates to your resources' },
                    { name: 'Team Invitations', description: 'Receive team invitation notifications' },
                    { name: 'Comments & Replies', description: 'Get notified when someone replies to your comments' },
                    { name: 'Marketing Emails', description: 'Receive updates about new features and promotions' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-nunito text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground font-nunito">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">
                  Privacy Settings
                </h2>

                <div className="space-y-4">
                  {[
                    { name: 'Profile Visibility', description: 'Make your profile visible to everyone' },
                    { name: 'Show Email', description: 'Display your email on your profile' },
                    { name: 'Show Activity', description: 'Show your recent activity on your profile' },
                    { name: 'Allow Messages', description: 'Allow other users to send you direct messages' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-nunito text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground font-nunito">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="bg-secondary/30 rounded-lg p-6">
                  <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">
                    Change Password
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-nunito text-foreground mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-nunito text-foreground mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-nunito text-foreground mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <Button className="font-hebden">Update Password</Button>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-lg p-6">
                  <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-muted-foreground font-nunito mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline" className="font-hebden">
                    <Icon icon="mdi:shield-check" width="20" height="20" />
                    Enable 2FA
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
