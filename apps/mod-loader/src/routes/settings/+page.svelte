<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { FolderOpen, AlertTriangle } from 'lucide-svelte';
  import { settings } from '$lib/stores/settings';
  import { open } from '@tauri-apps/plugin-dialog';
  import { exists } from '@tauri-apps/plugin-fs';

  let isValidPath = $state(true);

  $effect(() => {
    validatePath($settings.hytaleRoot);
  });

  async function validatePath(path: string) {
    if (!path) {
      isValidPath = false;
      return;
    }
    try {
      isValidPath = await exists(path);
    } catch (e) {
      isValidPath = false;
    }
  }

  async function handleBrowse() {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: $settings.hytaleRoot,
    });

    if (selected && typeof selected === 'string') {
      settings.updateHytaleRoot(selected);
    }
  }
</script>

<main class="flex-1 overflow-y-auto p-6 pb-24 relative">
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold">Settings</h1>
      <p class="mt-2 text-muted-foreground">
        Configure your mod loader preferences
      </p>
    </div>

    <!-- Settings Sections -->
    <div class="space-y-4">
      <!-- Paths -->
      <Card.Root class={!isValidPath ? 'border-destructive/50' : ''}>
        <Card.Header>
          <Card.Title class="flex items-center justify-between">
            Paths
            {#if !isValidPath}
              <div
                class="flex items-center text-destructive text-sm font-normal"
              >
                <AlertTriangle class="size-4 mr-2" />
                Invalid Directory
              </div>
            {/if}
          </Card.Title>
          <Card.Description>
            Configure where the mod loader looks for Hytale data
          </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div>
            <label for="hytale-path" class="mb-2 block text-sm font-medium">
              Hytale Directory (containing UserData)
            </label>
            <div class="flex gap-2">
              <input
                id="hytale-path"
                type="text"
                value={$settings.hytaleRoot}
                oninput={(e) =>
                  settings.updateHytaleRoot(e.currentTarget.value)}
                class="flex-1 rounded-lg border bg-muted px-3 py-2 text-sm text-foreground {!isValidPath
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'border-input'}"
              />
              <Button variant="outline" onclick={handleBrowse}>
                <FolderOpen class="mr-2 size-4" />
                Browse
              </Button>
            </div>
            {#if !isValidPath}
              <p class="text-xs text-destructive mt-2">
                The specified directory does not exist or is not essential.
                Please select a valid Hytale installation folder.
              </p>
            {/if}
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Mod Sources -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Mod Sources</Card.Title>
          <Card.Description>Enable or disable mod sources</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Orbis</p>
              <p class="text-sm text-muted-foreground">
                Official Orbis mod repository
              </p>
            </div>
            <button
              aria-label="Toggle Orbis source"
              class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors"
            >
              <span
                class="inline-block size-4 translate-x-6 transform rounded-full bg-white transition-transform"
              ></span>
            </button>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- About -->
      <Card.Root>
        <Card.Header>
          <Card.Title>About</Card.Title>
          <Card.Description>Information about the mod loader</Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="space-y-2 text-sm">
            <p><strong>Version:</strong> 0.2.1</p>
            <p><strong>Built with:</strong> Tauri + SvelteKit</p>
            <p><strong>Design:</strong> Orbis Theme</p>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</main>
