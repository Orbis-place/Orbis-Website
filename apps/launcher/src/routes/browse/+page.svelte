<script lang="ts">
  import { mods, categories } from '$lib/stores/mods';
  import { servers } from '$lib/stores/servers';
  import { toasts } from '$lib/stores/notifications';
  import { HYTALE_VERSIONS } from '$lib/stores/mockData';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';

  let searchQuery = '';
  let selectedCategory = 'all';
  let selectedVersion = '';
  let sortBy: 'downloads' | 'updated' | 'name' = 'downloads';

  // Install dialog
  let showInstallDialog = false;
  let selectedMod: (typeof $mods)[0] | null = null;
  let selectedServerId = '';

  $: filteredMods = mods.search(searchQuery, {
    category: selectedCategory,
    version: selectedVersion,
    sortBy,
  });

  $: dependencies = selectedMod ? mods.getDependencies(selectedMod.id) : [];

  function openInstallDialog(mod: (typeof $mods)[0]) {
    selectedMod = mod;
    selectedServerId = $servers[0]?.id || '';
    showInstallDialog = true;
  }

  function installMod() {
    if (!selectedMod || !selectedServerId) return;

    mods.installOnServer(selectedMod.id, selectedServerId);
    toasts.show(
      'success',
      `${selectedMod.name} installed${dependencies.length > 0 ? ` with ${dependencies.length} dependencies` : ''}`,
    );
    showInstallDialog = false;
    selectedMod = null;
  }

  function formatDownloads(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      gameplay: '🎮',
      performance: '⚡',
      admin: '🛡️',
      building: '🔨',
      utility: '🔧',
      social: '👥',
      economy: '💰',
    };
    return icons[category] || '📦';
  }

  function isInstalled(modId: string, serverId: string): boolean {
    const server = $servers.find((s) => s.id === serverId);
    return server?.installedMods.includes(modId) || false;
  }
</script>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold text-foreground">Browse Content</h1>
    <p class="text-muted-foreground">
      Discover mods and plugins for your Hytale servers
    </p>
  </div>

  <!-- Search and Filters -->
  <div class="flex flex-col sm:flex-row gap-4">
    <div class="relative flex-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <Input
        bind:value={searchQuery}
        placeholder="Search mods..."
        class="pl-10"
      />
    </div>

    <select
      bind:value={selectedVersion}
      class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
    >
      <option value="">All Versions</option>
      {#each HYTALE_VERSIONS as version}
        <option value={version}>{version}</option>
      {/each}
    </select>

    <select
      bind:value={sortBy}
      class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
    >
      <option value="downloads">Most Downloads</option>
      <option value="updated">Recently Updated</option>
      <option value="name">Name (A-Z)</option>
    </select>
  </div>

  <!-- Category Tabs -->
  <div class="flex flex-wrap gap-2">
    {#each categories as category}
      <button
        class="px-4 py-2 rounded-full text-sm transition-colors {selectedCategory ===
        category.id
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary hover:bg-secondary/80'}"
        onclick={() => (selectedCategory = category.id)}
      >
        {category.label}
      </button>
    {/each}
  </div>

  <!-- Results Count -->
  <p class="text-sm text-muted-foreground">
    {filteredMods.length} mod{filteredMods.length !== 1 ? 's' : ''} found
  </p>

  <!-- Mod Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredMods as mod (mod.id)}
      <Card.Root
        class="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
      >
        <Card.Header class="pb-3">
          <div class="flex items-start gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center text-2xl"
            >
              {getCategoryIcon(mod.category)}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <Card.Title class="text-base truncate">{mod.name}</Card.Title>
                {#if mod.hasUpdate}
                  <Badge variant="secondary" class="text-xs">Update</Badge>
                {/if}
              </div>
              <p class="text-sm text-muted-foreground">by {mod.author}</p>
            </div>
          </div>
        </Card.Header>
        <Card.Content class="pt-0 space-y-3">
          <p class="text-sm text-muted-foreground line-clamp-2">
            {mod.description}
          </p>

          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <div class="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              {formatDownloads(mod.downloads)}
            </div>
            <div class="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                />
              </svg>
              {formatDownloads(mod.likes)}
            </div>
            <Badge variant="outline" class="text-xs">v{mod.version}</Badge>
          </div>

          {#if mod.dependencies.length > 0}
            <div class="text-xs text-muted-foreground">
              Requires: {mods
                .getDependencies(mod.id)
                .map((d) => d.name)
                .join(', ')}
            </div>
          {/if}
        </Card.Content>
        <Card.Footer class="pt-0">
          <Button class="w-full" onclick={() => openInstallDialog(mod)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Install
          </Button>
        </Card.Footer>
      </Card.Root>
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">No mods found</h3>
        <p class="text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    {/each}
  </div>
</div>

<!-- Install Dialog -->
<Dialog.Root bind:open={showInstallDialog}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Install {selectedMod?.name}</Dialog.Title>
      <Dialog.Description>
        Choose a server to install this mod on
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 py-4">
      {#if $servers.length > 0}
        <div class="space-y-2">
          <label class="text-sm font-medium">Select Server</label>
          <select
            bind:value={selectedServerId}
            class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            {#each $servers as server}
              <option value={server.id}>
                {server.name}
                {isInstalled(selectedMod?.id || '', server.id)
                  ? '(Installed)'
                  : ''}
              </option>
            {/each}
          </select>
        </div>

        {#if dependencies.length > 0}
          <div
            class="p-3 rounded-lg bg-status-pending/10 border border-status-pending/30"
          >
            <p class="text-sm font-medium text-status-pending mb-1">
              Dependencies Required
            </p>
            <p class="text-sm text-muted-foreground">
              The following mods will also be installed:
            </p>
            <ul class="mt-2 space-y-1">
              {#each dependencies as dep}
                <li class="text-sm flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {dep.name}
                  <span class="text-muted-foreground">v{dep.version}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if selectedServerId && isInstalled(selectedMod?.id || '', selectedServerId)}
          <div
            class="p-3 rounded-lg bg-status-approved/10 border border-status-approved/30"
          >
            <p class="text-sm text-status-approved">
              This mod is already installed on the selected server
            </p>
          </div>
        {/if}
      {:else}
        <div class="text-center py-4">
          <p class="text-muted-foreground mb-2">No servers available</p>
          <Button variant="link" href="/servers">Create a server first</Button>
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (showInstallDialog = false)}>
        Cancel
      </Button>
      <Button
        onclick={installMod}
        disabled={!selectedServerId ||
          isInstalled(selectedMod?.id || '', selectedServerId)}
      >
        Install{dependencies.length > 0
          ? ` (${dependencies.length + 1} mods)`
          : ''}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
