<script lang="ts">
  import { servers, runningCount, totalPlayers } from '$lib/stores/servers';
  import { notifications } from '$lib/stores/notifications';
  import { mods, modsWithUpdatesCount } from '$lib/stores/mods';
  import { goto } from '$app/navigation';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';

  // Quick actions
  const quickActions = [
    {
      id: 'servers',
      title: 'Manage Servers',
      description: 'Create and manage your Hytale servers',
      icon: 'server',
      href: '/servers',
    },
    {
      id: 'browse',
      title: 'Browse Mods',
      description: 'Find mods and plugins for your servers',
      icon: 'compass',
      href: '/browse',
    },
    {
      id: 'files',
      title: 'File Manager',
      description: 'Edit configs and manage server files',
      icon: 'folder',
      href: '/files',
    },
  ];

  function handleStart(id: string) {
    servers.start(id);
  }

  function handleStop(id: string) {
    servers.stop(id);
  }

  function formatUptime(seconds: number): string {
    if (seconds === 0) return '--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'running':
        return 'bg-status-approved';
      case 'starting':
      case 'stopping':
        return 'bg-status-pending';
      default:
        return 'bg-muted-foreground';
    }
  }

  $: runningServers = $servers.filter((s) => s.status === 'running');
  $: modsNeedingUpdate = $mods.filter((m) => m.hasUpdate);
</script>

<div class="p-6 space-y-6">
  <!-- Welcome Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Welcome back!</h1>
      <p class="text-muted-foreground">
        Here's an overview of your Hytale servers
      </p>
    </div>
    <Button href="/servers">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      Create Server
    </Button>
  </div>

  <!-- Stats Overview -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card.Root
      class="bg-gradient-to-br from-primary/10 to-transparent border-primary/30"
    >
      <Card.Content class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Running Servers</p>
            <p class="text-3xl font-bold">{$runningCount}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="3" width="20" height="6" rx="1" />
              <rect x="2" y="15" width="20" height="6" rx="1" />
            </svg>
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Players</p>
            <p class="text-3xl font-bold">{$totalPlayers}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-secondary flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-foreground"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Servers</p>
            <p class="text-3xl font-bold">{$servers.length}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-secondary flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-foreground"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Mod Updates</p>
            <p class="text-3xl font-bold">{$modsWithUpdatesCount}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-secondary flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-foreground"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Running Servers -->
    <div class="lg:col-span-2 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Active Servers</h2>
        <Button variant="link" href="/servers">View all</Button>
      </div>

      {#if runningServers.length > 0}
        <div class="space-y-3">
          {#each runningServers as server (server.id)}
            <Card.Root
              class="cursor-pointer hover:border-primary/50 transition-all"
            >
              <button
                class="w-full text-left"
                onclick={() => goto(`/servers/${server.id}`)}
              >
                <Card.Content class="p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-5 h-5 text-primary"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                        >
                          <rect x="2" y="3" width="20" height="6" rx="1" />
                          <rect x="2" y="15" width="20" height="6" rx="1" />
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium flex items-center gap-2">
                          {server.name}
                          <span
                            class="w-2 h-2 rounded-full bg-status-approved animate-pulse"
                          ></span>
                        </p>
                        <p class="text-sm text-muted-foreground">
                          {server.players.length}/{server.maxPlayers} players • TPS:
                          {server.stats.tps.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <div class="text-right">
                        <p class="text-sm text-muted-foreground">Uptime</p>
                        <p class="font-medium">
                          {formatUptime(server.stats.uptime)}
                        </p>
                      </div>
                      <div class="w-24">
                        <p class="text-xs text-muted-foreground mb-1">RAM</p>
                        <Progress
                          value={(server.stats.ram / server.stats.ramMax) * 100}
                          class="h-2"
                        />
                        <p class="text-xs text-muted-foreground mt-1">
                          {server.stats.ram.toFixed(1)}/{server.stats.ramMax}GB
                        </p>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </button>
            </Card.Root>
          {/each}
        </div>
      {:else}
        <Card.Root>
          <Card.Content class="p-8 text-center">
            <div
              class="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="3" width="20" height="6" rx="1" />
                <rect x="2" y="15" width="20" height="6" rx="1" />
              </svg>
            </div>
            <p class="text-muted-foreground mb-2">No servers running</p>
            <Button variant="outline" href="/servers">Start a server</Button>
          </Card.Content>
        </Card.Root>
      {/if}

      <!-- Quick Actions -->
      <h2 class="text-lg font-semibold pt-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        {#each quickActions as action}
          <a href={action.href}>
            <Card.Root
              class="hover:border-primary/50 transition-all cursor-pointer h-full"
            >
              <Card.Content class="p-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"
                  >
                    {#if action.icon === 'server'}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <rect x="2" y="3" width="20" height="6" rx="1" />
                        <rect x="2" y="15" width="20" height="6" rx="1" />
                      </svg>
                    {:else if action.icon === 'compass'}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z" />
                      </svg>
                    {:else if action.icon === 'folder'}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"
                        />
                      </svg>
                    {/if}
                  </div>
                  <div>
                    <p class="font-medium">{action.title}</p>
                    <p class="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </a>
        {/each}
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-4">
      <!-- Notifications -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Recent Activity</h2>
      </div>
      <Card.Root>
        <Card.Content class="p-0">
          {#each $notifications.slice(0, 5) as notif (notif.id)}
            <div
              class="p-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
            >
              <div class="flex items-start gap-2">
                <span
                  class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 {notif.type ===
                  'error'
                    ? 'bg-destructive'
                    : notif.type === 'warning'
                      ? 'bg-status-pending'
                      : notif.type === 'success'
                        ? 'bg-status-approved'
                        : 'bg-primary'}"
                ></span>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm">{notif.title}</p>
                  <p class="text-xs text-muted-foreground truncate">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          {:else}
            <div class="p-6 text-center text-muted-foreground text-sm">
              No recent activity
            </div>
          {/each}
        </Card.Content>
      </Card.Root>

      <!-- Mod Updates -->
      {#if modsNeedingUpdate.length > 0}
        <h2 class="text-lg font-semibold">Available Updates</h2>
        <Card.Root>
          <Card.Content class="p-0">
            {#each modsNeedingUpdate as mod (mod.id)}
              <div
                class="p-3 border-b border-border last:border-0 flex items-center justify-between"
              >
                <div>
                  <p class="font-medium text-sm">{mod.name}</p>
                  <p class="text-xs text-muted-foreground">
                    New version available
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => {
                    mods.updateMod(mod.id);
                  }}
                >
                  Update
                </Button>
              </div>
            {/each}
          </Card.Content>
        </Card.Root>
      {/if}
    </div>
  </div>
</div>
