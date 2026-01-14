<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { AlertTriangle } from 'lucide-svelte';
  import { settings } from '$lib/stores/settings';
  import { open } from '@tauri-apps/plugin-dialog';
  import { exists } from '@tauri-apps/plugin-fs';

  let isValidPath = $state(true);

  // Validate path whenever it changes
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

{#if !isValidPath}
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300"
  >
    <div
      class="bg-destructive text-destructive-foreground rounded-xl shadow-lg border border-destructive/20 p-4 flex items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <div class="bg-white/20 p-2 rounded-lg">
          <AlertTriangle class="size-5 text-white" />
        </div>
        <div class="flex flex-col">
          <span class="font-hebden font-bold text-sm uppercase tracking-wide"
            >Invalid Path Detected</span
          >
          <span class="text-xs opacity-90 font-nunito"
            >The configured Hytale directory could not be found.</span
          >
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onclick={handleBrowse}
        class="font-hebden text-xs uppercase tracking-wide bg-white/10 hover:bg-white/20 text-white border border-white/10"
      >
        Fix Path
      </Button>
    </div>
  </div>
{/if}
