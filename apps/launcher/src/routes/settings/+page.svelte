<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import { HYTALE_VERSIONS } from '$lib/stores/mockData';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { toasts } from '$lib/stores/notifications';

  function saveSettings() {
    toasts.show('success', 'Settings saved');
  }

  function resetSettings() {
    settings.reset();
    toasts.show('info', 'Settings reset to defaults');
  }
</script>

<div class="p-6 space-y-6 max-w-3xl">
  <div>
    <h1 class="text-2xl font-bold text-foreground">Settings</h1>
    <p class="text-muted-foreground">Configure the Orbis Launcher</p>
  </div>

  <!-- General Settings -->
  <Card.Root>
    <Card.Header>
      <Card.Title>General</Card.Title>
      <Card.Description>Application behavior and preferences</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label>Launch at Startup</Label>
          <p class="text-sm text-muted-foreground">
            Automatically start the launcher when your system boots
          </p>
        </div>
        <Switch bind:checked={$settings.autoStart} />
      </div>

      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label>Minimize to Tray</Label>
          <p class="text-sm text-muted-foreground">
            Keep running in the background when closing the window
          </p>
        </div>
        <Switch bind:checked={$settings.minimizeToTray} />
      </div>

      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label>Notifications</Label>
          <p class="text-sm text-muted-foreground">
            Show notifications for server events and updates
          </p>
        </div>
        <Switch bind:checked={$settings.notifications} />
      </div>

      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label>Auto-update Mods</Label>
          <p class="text-sm text-muted-foreground">
            Automatically download and install mod updates
          </p>
        </div>
        <Switch bind:checked={$settings.autoUpdateMods} />
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Server Defaults -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Server Defaults</Card.Title>
      <Card.Description>
        Default values for new server instances
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-6">
      <div class="space-y-2">
        <Label>Default Hytale Version</Label>
        <select
          bind:value={$settings.defaultVersion}
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {#each HYTALE_VERSIONS as version}
            <option value={version}>{version}</option>
          {/each}
        </select>
      </div>

      <div class="space-y-2">
        <Label>Default Memory (GB): {$settings.defaultMemory}</Label>
        <input
          type="range"
          bind:value={$settings.defaultMemory}
          min={1}
          max={16}
          class="w-full"
        />
        <p class="text-xs text-muted-foreground">
          Recommended: 4-8 GB for most servers
        </p>
      </div>

      <div class="space-y-2">
        <Label>Default Max Players</Label>
        <Input
          type="number"
          bind:value={$settings.defaultMaxPlayers}
          min={1}
          max={1000}
        />
      </div>

      <div class="space-y-2">
        <Label>Servers Directory</Label>
        <div class="flex gap-2">
          <Input bind:value={$settings.serversPath} class="flex-1" />
          <Button variant="outline">Browse</Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- About -->
  <Card.Root>
    <Card.Header>
      <Card.Title>About</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="flex items-center gap-4">
        <img src="/icon.png" alt="Orbis" class="w-16 h-16 rounded-xl" />
        <div>
          <h3 class="text-lg font-bold">Orbis Launcher</h3>
          <p class="text-sm text-muted-foreground">Version 1.0.0-beta</p>
        </div>
      </div>
      <p class="text-sm text-muted-foreground">
        The ultimate Hytale server management tool. Create, configure, and
        manage your servers with ease.
      </p>
      <div class="flex gap-2">
        <Button variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            />
          </svg>
          GitHub
        </Button>
        <Button variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
          Discord
        </Button>
        <Button variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          Help
        </Button>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Actions -->
  <div class="flex justify-between">
    <Button variant="destructive" onclick={resetSettings}>
      Reset to Defaults
    </Button>
    <Button onclick={saveSettings}>Save Settings</Button>
  </div>
</div>
