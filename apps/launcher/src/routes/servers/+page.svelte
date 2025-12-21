<script lang="ts">
  import { servers, runningCount } from '$lib/stores/servers';
  import { mods, modsWithUpdatesCount } from '$lib/stores/mods';
  import { goto } from '$app/navigation';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { HYTALE_VERSIONS } from '$lib/stores/mockData';

  // Create server dialog state
  let showCreateDialog = false;
  let newServer = {
    name: '',
    port: 25565,
    maxPlayers: 20,
    motd: 'A Hytale Server',
    version: HYTALE_VERSIONS[0],
    memory: 4,
  };

  function createServer() {
    if (!newServer.name.trim()) return;
    const id = servers.create(newServer);
    showCreateDialog = false;
    resetForm();
    goto(`/servers/${id}`);
  }

  function resetForm() {
    newServer = {
      name: '',
      port: 25565,
      maxPlayers: 20,
      motd: 'A Hytale Server',
      version: HYTALE_VERSIONS[0],
      memory: 4,
    };
  }

  function handleStart(e: MouseEvent, id: string) {
    e.stopPropagation();
    servers.start(id);
  }

  function handleStop(e: MouseEvent, id: string) {
    e.stopPropagation();
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
        return 'bg-status-pending animate-pulse';
      default:
        return 'bg-muted-foreground';
    }
  }

  function getInstalledModsCount(serverId: string): number {
    const server = $servers.find((s) => s.id === serverId);
    return server?.installedMods.length || 0;
  }
</script>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Servers</h1>
      <p class="text-muted-foreground">Manage your Hytale server instances</p>
    </div>
    <Button onclick={() => (showCreateDialog = true)}>
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

  <!-- Server Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each $servers as server (server.id)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="text-left w-full cursor-pointer"
        onclick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          goto(`/servers/${server.id}`);
        }}
      >
        <Card.Root
          class="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
        >
          <Card.Header class="pb-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center"
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
                    <circle cx="6" cy="6" r="1" fill="currentColor" />
                    <circle cx="6" cy="18" r="1" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <Card.Title class="text-base">{server.name}</Card.Title>
                  <p class="text-sm text-muted-foreground">
                    Port: {server.port}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="w-2.5 h-2.5 rounded-full {getStatusColor(
                    server.status,
                  )}"
                ></span>
                <span class="text-xs text-muted-foreground capitalize">
                  {server.status}
                </span>
              </div>
            </div>
          </Card.Header>
          <Card.Content class="pt-0 space-y-3">
            <!-- Stats -->
            {#if server.status === 'running'}
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-secondary/50 rounded-lg p-2 text-center">
                  <p class="text-xs text-muted-foreground">Players</p>
                  <p class="font-semibold">
                    {server.players.length}/{server.maxPlayers}
                  </p>
                </div>
                <div class="bg-secondary/50 rounded-lg p-2 text-center">
                  <p class="text-xs text-muted-foreground">TPS</p>
                  <p class="font-semibold">{server.stats.tps.toFixed(1)}</p>
                </div>
                <div class="bg-secondary/50 rounded-lg p-2 text-center">
                  <p class="text-xs text-muted-foreground">Uptime</p>
                  <p class="font-semibold">
                    {formatUptime(server.stats.uptime)}
                  </p>
                </div>
              </div>
            {:else}
              <div
                class="flex items-center gap-4 text-sm text-muted-foreground"
              >
                <span>{server.version}</span>
                <span>•</span>
                <span>{getInstalledModsCount(server.id)} mods</span>
              </div>
            {/if}

            <!-- Actions -->
            <div class="flex gap-2 pt-2">
              {#if server.status === 'running'}
                <Button
                  variant="destructive"
                  size="sm"
                  class="flex-1"
                  onclick={(e) => handleStop(e, server.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  Stop
                </Button>
              {:else if server.status === 'stopped'}
                <Button
                  variant="default"
                  size="sm"
                  class="flex-1"
                  onclick={(e) => handleStart(e, server.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Start
                </Button>
              {:else}
                <Button variant="secondary" size="sm" class="flex-1" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 mr-1 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {server.status === 'starting' ? 'Starting...' : 'Stopping...'}
                </Button>
              {/if}
              <Button
                onclick={(e) => {
                  e.stopPropagation();
                  goto(`/servers/${server.id}`);
                }}
                variant="outline"
                size="sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
              </Button>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    {:else}
      <div
        class="col-span-full flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-10 h-10 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <rect x="2" y="3" width="20" height="6" rx="1" />
            <rect x="2" y="15" width="20" height="6" rx="1" />
            <circle cx="6" cy="6" r="1" fill="currentColor" />
            <circle cx="6" cy="18" r="1" fill="currentColor" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">No servers yet</h3>
        <p class="text-muted-foreground mb-4">
          Create your first Hytale server to get started
        </p>
        <Button onclick={() => (showCreateDialog = true)}>Create Server</Button>
      </div>
    {/each}
  </div>
</div>

<!-- Create Server Dialog -->
<Dialog.Root bind:open={showCreateDialog}>
  <Dialog.Content class="max-w-lg">
    <Dialog.Header>
      <Dialog.Title>Create New Server</Dialog.Title>
      <Dialog.Description>
        Configure your new Hytale server instance
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 py-4">
      <!-- Name -->
      <div class="space-y-2">
        <Label for="name">Server Name</Label>
        <Input
          id="name"
          bind:value={newServer.name}
          placeholder="My Hytale Server"
        />
      </div>

      <!-- Port -->
      <div class="space-y-2">
        <Label for="port">Port</Label>
        <Input
          id="port"
          type="number"
          bind:value={newServer.port}
          min={1024}
          max={65535}
        />
      </div>

      <!-- Max Players -->
      <div class="space-y-2">
        <Label for="maxPlayers">Max Players: {newServer.maxPlayers}</Label>
        <input
          type="range"
          bind:value={newServer.maxPlayers}
          min={1}
          max={100}
          class="w-full"
        />
      </div>

      <!-- Memory -->
      <div class="space-y-2">
        <Label for="memory">Memory (GB): {newServer.memory}</Label>
        <input
          type="range"
          bind:value={newServer.memory}
          min={1}
          max={16}
          class="w-full"
        />
      </div>

      <!-- Version -->
      <div class="space-y-2">
        <Label>Hytale Version</Label>
        <select
          bind:value={newServer.version}
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {#each HYTALE_VERSIONS as version}
            <option value={version}>{version}</option>
          {/each}
        </select>
      </div>

      <!-- MOTD -->
      <div class="space-y-2">
        <Label for="motd">MOTD (Message of the Day)</Label>
        <Input id="motd" bind:value={newServer.motd} placeholder="Welcome!" />
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (showCreateDialog = false)}>
        Cancel
      </Button>
      <Button onclick={createServer} disabled={!newServer.name.trim()}>
        Create Server
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
