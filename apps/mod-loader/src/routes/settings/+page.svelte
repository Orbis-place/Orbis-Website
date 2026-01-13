<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { FolderOpen } from 'lucide-svelte';
</script>

<main class="flex-1 overflow-y-auto p-6">
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
      <Card.Root>
        <Card.Header>
          <Card.Title>Paths</Card.Title>
          <Card.Description>
            Configure where the mod loader looks for saves and mods
          </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div>
            <label for="saves-path" class="mb-2 block text-sm font-medium">
              Hytale Saves Directory
            </label>
            <div class="flex gap-2">
              <input
                id="saves-path"
                type="text"
                value="~/Library/Application Support/Hytale/UserData/Saves"
                readonly
                class="flex-1 rounded-lg border border-input bg-muted px-3 py-2 text-sm"
              />
              <Button variant="outline">
                <FolderOpen class="size-4" />
                Browse
              </Button>
            </div>
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
            <p><strong>Version:</strong> 0.1.0</p>
            <p><strong>Built with:</strong> Tauri + SvelteKit</p>
            <p><strong>Design:</strong> Orbis Theme</p>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</main>
