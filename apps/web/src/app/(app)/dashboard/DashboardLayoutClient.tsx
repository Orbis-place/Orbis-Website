'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { cn } from '@/lib/utils';

const dashboardNav = [
  {
    section: 'General',
    items: [
      {
        name: 'Profile',
        href: '/dashboard/profile',
        icon: 'mdi:account',
      },
      {
        name: 'My Reports',
        href: '/dashboard/reports',
        icon: 'mdi:flag',
      },
      {
        name: 'Notifications',
        href: '/dashboard/notifications',
        icon: 'mdi:bell',
      },
      /* {
         name: 'Collections',
         href: '/dashboard/collections',
         icon: 'mdi:view-list',
       },*/
    ],
  },
  {
    section: 'Content',
    items: [
      {
        name: 'My Resources',
        href: '/dashboard/resources',
        icon: 'mdi:package-variant',
      },
      {
        name: 'My Teams',
        href: '/dashboard/teams',
        icon: 'mdi:account-group',
      },
      {
        name: 'My Servers',
        href: '/dashboard/servers',
        icon: 'mdi:server',
      },
    ],
  },
  {
    section: 'Settings',
    items: [
      {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: 'mdi:cog',
      },
    ],
  },
];

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-secondary/30 rounded-lg p-4 space-y-6">
              <h2 className="font-hebden text-xl font-semibold text-foreground">
                Dashboard
              </h2>
              {dashboardNav.map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-hebden text-sm font-semibold text-foreground/60 mb-2 px-3">
                    {section.section}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-nunito',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-secondary/50'
                            )}
                          >
                            <Icon icon={item.icon} width="20" height="20" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
