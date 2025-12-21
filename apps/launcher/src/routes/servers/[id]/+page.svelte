<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { servers } from '$lib/stores/servers';
  import { mods } from '$lib/stores/mods';
  import { files, backups } from '$lib/stores/files';
  import { toasts } from '$lib/stores/notifications';
  import { HYTALE_VERSIONS } from '$lib/stores/mockData';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import * as Select from '$lib/components/ui/select';
  import { Switch } from '$lib/components/ui/switch';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import { tick, onMount, onDestroy } from 'svelte';

  $: serverId = $page.params.id;
  $: server = $servers.find((s) => s.id === serverId);
  $: installedMods = server ? mods.getInstalledOnServer(server.id) : [];
  $: serverBackups = server ? backups.getForServer(server.id) : [];

  let commandInput = '';
  let logContainer: HTMLDivElement;
  let activeTab = 'console';

  // Auto-scroll logs
  $: if (server?.consoleLogs && logContainer) {
    tick().then(() => {
      logContainer.scrollTop = logContainer.scrollHeight;
    });
  }

  function sendCommand() {
    if (!commandInput.trim() || !server) return;
    servers.sendCommand(server.id, commandInput);
    commandInput = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      sendCommand();
    }
  }

  function handleStart() {
    if (server) servers.start(server.id);
  }

  function handleStop() {
    if (server) servers.stop(server.id);
  }

  function handleRestart() {
    if (server) servers.restart(server.id);
  }

  function handleDuplicate() {
    if (server) {
      const newId = servers.duplicate(server.id);
      if (newId) {
        toasts.show('success', `Server duplicated as "${server.name} (Copy)"`);
        goto(`/servers/${newId}`);
      }
    }
  }

  function handleDelete() {
    if (server && confirm(`Delete server "${server.name}"?`)) {
      servers.delete(server.id);
      toasts.show('success', 'Server deleted');
      goto('/servers');
    }
  }

  function uninstallMod(modId: string) {
    if (server) {
      servers.uninstallMod(server.id, modId);
      toasts.show('success', 'Mod uninstalled');
    }
  }

  function createBackup(type: 'full' | 'worlds' | 'config') {
    if (server) {
      const name = `${type.charAt(0).toUpperCase() + type.slice(1)} Backup - ${new Date().toLocaleDateString()}`;
      backups.create(server.id, name, type);
      toasts.show('success', 'Backup created');
    }
  }

  function restoreBackup(id: string) {
    backups.restore(id);
    toasts.show('success', 'Backup restored');
  }

  function deleteBackup(id: string) {
    backups.delete(id);
    toasts.show('success', 'Backup deleted');
  }

  function formatUptime(seconds: number): string {
    if (seconds === 0) return '--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
  }

  function formatBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(1) + ' GB';
  }

  function getLogLevelClass(level: string): string {
    switch (level) {
      case 'error':
        return 'text-destructive';
      case 'warn':
        return 'text-status-pending';
      case 'debug':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // Config editing
  let editedConfig = {
    name: '',
    port: 25565,
    maxPlayers: 20,
    motd: '',
    version: '',
    memory: 4,
    autoRestart: false,
    whitelistEnabled: false,
  };

  $: if (server) {
    editedConfig = { ...server.config };
  }

  function saveConfig() {
    if (server) {
      servers.updateConfig(server.id, editedConfig);
      toasts.show('success', 'Configuration saved');
    }
  }
</script>

{#if server}
  <div class="p-6 space-y-6 h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <button
          onclick={() => goto('/servers')}
          class="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="m12 19-7-7 7-7M19 12H5" />
          </svg>
        </button>
        <div
          class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-7 h-7 text-primary"
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
          <h1 class="text-2xl font-bold flex items-center gap-3">
            {server.name}
            <span
              class="w-3 h-3 rounded-full {server.status === 'running'
                ? 'bg-status-approved'
                : server.status === 'stopped'
                  ? 'bg-muted-foreground'
                  : 'bg-status-pending animate-pulse'}"
            ></span>
          </h1>
          <div class="flex items-center gap-3 text-muted-foreground text-sm">
            <span>{server.version}</span>
            <span>•</span>
            <span>Port {server.port}</span>
            <span>•</span>
            <span>{server.players.length}/{server.maxPlayers} players</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        {#if server.status === 'running'}
          <Button variant="outline" onclick={handleRestart}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Restart
          </Button>
          <Button variant="destructive" onclick={handleStop}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop
          </Button>
        {:else if server.status === 'stopped'}
          <Button onclick={handleStart}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <polygon points="5 3 19 12 5 21" />
            </svg>
            Start
          </Button>
        {:else}
          <Button disabled>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-2 animate-spin"
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
      </div>
    </div>

    <!-- Stats Bar -->
    {#if server.status === 'running'}
      <div class="grid grid-cols-4 gap-4">
        <Card.Root class="bg-secondary/30">
          <Card.Content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-muted-foreground">CPU</p>
                <p class="text-2xl font-bold">{server.stats.cpu.toFixed(0)}%</p>
              </div>
              <div class="w-12 h-12">
                <Progress value={server.stats.cpu} class="h-2" />
              </div>
            </div>
          </Card.Content>
        </Card.Root>
        <Card.Root class="bg-secondary/30">
          <Card.Content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-muted-foreground">RAM</p>
                <p class="text-2xl font-bold">
                  {server.stats.ram.toFixed(1)}/{server.stats.ramMax}GB
                </p>
              </div>
              <Progress
                value={(server.stats.ram / server.stats.ramMax) * 100}
                class="w-12 h-2"
              />
            </div>
          </Card.Content>
        </Card.Root>
        <Card.Root class="bg-secondary/30">
          <Card.Content class="p-4">
            <p class="text-xs text-muted-foreground">TPS</p>
            <p class="text-2xl font-bold">{server.stats.tps.toFixed(1)}</p>
          </Card.Content>
        </Card.Root>
        <Card.Root class="bg-secondary/30">
          <Card.Content class="p-4">
            <p class="text-xs text-muted-foreground">Uptime</p>
            <p class="text-2xl font-bold">
              {formatUptime(server.stats.uptime)}
            </p>
          </Card.Content>
        </Card.Root>
      </div>
    {/if}

    <!-- Tabs -->
    <Tabs.Root bind:value={activeTab} class="flex-1 flex flex-col min-h-0">
      <Tabs.List class="w-fit">
        <Tabs.Trigger value="console">Console</Tabs.Trigger>
        <Tabs.Trigger value="config">Configuration</Tabs.Trigger>
        <Tabs.Trigger value="mods">Mods ({installedMods.length})</Tabs.Trigger>
        <Tabs.Trigger value="players"
          >Players ({server.players.length})</Tabs.Trigger
        >
        <Tabs.Trigger value="backups">Backups</Tabs.Trigger>
      </Tabs.List>

      <!-- Console Tab -->
      <Tabs.Content value="console" class="flex-1 flex flex-col min-h-0 mt-4">
        <Card.Root class="flex-1 flex flex-col min-h-0">
          <div
            bind:this={logContainer}
            class="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black/20 rounded-t-lg min-h-[300px] max-h-[400px]"
          >
            {#each server.consoleLogs as log (log.id)}
              <div class="py-0.5 {getLogLevelClass(log.level)}">
                <span class="text-muted-foreground"
                  >[{formatTime(log.timestamp)}]</span
                >
                <span class="ml-2">{log.message}</span>
              </div>
            {:else}
              <div class="text-muted-foreground text-center py-8">
                No logs yet. Start the server to see activity.
              </div>
            {/each}
          </div>
          <div class="p-3 border-t border-border flex gap-2">
            <Input
              bind:value={commandInput}
              onkeydown={handleKeydown}
              placeholder={server.status === 'running'
                ? 'Enter command...'
                : 'Server is not running'}
              disabled={server.status !== 'running'}
              class="font-mono"
            />
            <Button
              onclick={sendCommand}
              disabled={server.status !== 'running'}
            >
              Send
            </Button>
            <Button
              variant="outline"
              onclick={() => servers.clearLogs(server.id)}
            >
              Clear
            </Button>
          </div>
        </Card.Root>
      </Tabs.Content>

      <!-- Config Tab -->
      <Tabs.Content value="config" class="mt-4">
        <Card.Root>
          <Card.Header>
            <Card.Title>Server Configuration</Card.Title>
            <Card.Description>
              Modify server properties and settings
            </Card.Description>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="cfg-name">Server Name</Label>
                <Input id="cfg-name" bind:value={editedConfig.name} />
              </div>
              <div class="space-y-2">
                <Label for="cfg-port">Port</Label>
                <Input
                  id="cfg-port"
                  type="number"
                  bind:value={editedConfig.port}
                />
              </div>
              <div class="space-y-2">
                <Label for="cfg-max">Max Players</Label>
                <Input
                  id="cfg-max"
                  type="number"
                  bind:value={editedConfig.maxPlayers}
                />
              </div>
              <div class="space-y-2">
                <Label for="cfg-mem">Memory (GB)</Label>
                <Input
                  id="cfg-mem"
                  type="number"
                  bind:value={editedConfig.memory}
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="cfg-motd">MOTD</Label>
              <Input id="cfg-motd" bind:value={editedConfig.motd} />
            </div>

            <div class="space-y-2">
              <Label>Hytale Version</Label>
              <Select.Root
                onSelectedChange={(v) => {
                  if (v) editedConfig.version = v.value;
                }}
              >
                <Select.Trigger>
                  <Select.Value placeholder={editedConfig.version} />
                </Select.Trigger>
                <Select.Content>
                  {#each HYTALE_VERSIONS as version}
                    <Select.Item value={version}>{version}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>

            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Auto Restart</Label>
                <p class="text-sm text-muted-foreground">
                  Automatically restart server on crash
                </p>
              </div>
              <Switch bind:checked={editedConfig.autoRestart} />
            </div>

            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Whitelist</Label>
                <p class="text-sm text-muted-foreground">
                  Only allow whitelisted players
                </p>
              </div>
              <Switch bind:checked={editedConfig.whitelistEnabled} />
            </div>
          </Card.Content>
          <Card.Footer class="flex justify-between">
            <div class="flex gap-2">
              <Button variant="outline" onclick={handleDuplicate}>
                Duplicate Server
              </Button>
              <Button variant="destructive" onclick={handleDelete}>
                Delete Server
              </Button>
            </div>
            <Button onclick={saveConfig}>Save Changes</Button>
          </Card.Footer>
        </Card.Root>
      </Tabs.Content>

      <!-- Mods Tab -->
      <Tabs.Content value="mods" class="mt-4">
        <Card.Root>
          <Card.Header>
            <div class="flex items-center justify-between">
              <div>
                <Card.Title>Installed Mods</Card.Title>
                <Card.Description>
                  Manage mods installed on this server
                </Card.Description>
              </div>
              <Button onclick={() => goto('/browse')}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Browse Mods
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            {#if installedMods.length > 0}
              <div class="space-y-3">
                {#each installedMods as mod (mod.id)}
                  <div
                    class="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-5 h-5 text-primary"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium">{mod.name}</p>
                        <p class="text-sm text-muted-foreground">
                          v{mod.version} by {mod.author}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      {#if mod.hasUpdate}
                        <Badge variant="secondary">Update available</Badge>
                      {/if}
                      <Button
                        variant="ghost"
                        size="sm"
                        onclick={() => uninstallMod(mod.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-muted-foreground">
                <p>No mods installed</p>
                <Button variant="link" onclick={() => goto('/browse')}>
                  Browse available mods
                </Button>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </Tabs.Content>

      <!-- Players Tab -->
      <Tabs.Content value="players" class="mt-4">
        <Card.Root>
          <Card.Header>
            <Card.Title>Connected Players</Card.Title>
            <Card.Description>
              {server.players.length} of {server.maxPlayers} slots used
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {#if server.players.length > 0}
              <div class="space-y-2">
                {#each server.players as player (player.id)}
                  <div
                    class="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
                      >
                        <span class="text-lg">👤</span>
                      </div>
                      <div>
                        <p class="font-medium">{player.username}</p>
                        <p class="text-sm text-muted-foreground">
                          Joined {new Date(
                            player.joinedAt,
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" class="text-status-approved">
                      Online
                    </Badge>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-muted-foreground">
                <p>No players connected</p>
                {#if server.status === 'running'}
                  <Button
                    variant="link"
                    onclick={() => servers.simulatePlayerJoin(server.id)}
                  >
                    Simulate player join
                  </Button>
                {/if}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </Tabs.Content>

      <!-- Backups Tab -->
      <Tabs.Content value="backups" class="mt-4">
        <Card.Root>
          <Card.Header>
            <div class="flex items-center justify-between">
              <div>
                <Card.Title>Backups</Card.Title>
                <Card.Description>
                  Manage server backups and restore points
                </Card.Description>
              </div>
              <div class="flex gap-2">
                <Button
                  variant="outline"
                  onclick={() => createBackup('config')}
                >
                  Config Only
                </Button>
                <Button
                  variant="outline"
                  onclick={() => createBackup('worlds')}
                >
                  Worlds Only
                </Button>
                <Button onclick={() => createBackup('full')}>
                  Full Backup
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            {#if serverBackups.length > 0}
              <div class="space-y-2">
                {#each serverBackups as backup (backup.id)}
                  <div
                    class="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                          />
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium">{backup.name}</p>
                        <p class="text-sm text-muted-foreground">
                          {backup.size} • {new Date(
                            backup.createdAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <Badge variant="outline">{backup.type}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onclick={() => restoreBackup(backup.id)}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onclick={() => deleteBackup(backup.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-muted-foreground">
                <p>No backups yet</p>
                <p class="text-sm">Create a backup to protect your data</p>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </Tabs.Content>
    </Tabs.Root>
  </div>
{:else}
  <div class="flex items-center justify-center h-full">
    <div class="text-center">
      <h2 class="text-xl font-semibold mb-2">Server not found</h2>
      <p class="text-muted-foreground mb-4">
        The server you're looking for doesn't exist
      </p>
      <Button onclick={() => goto('/servers')}>Back to Servers</Button>
    </div>
  </div>
{/if}
