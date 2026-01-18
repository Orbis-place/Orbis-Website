<script lang="ts">
  import '../app.css';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import Sidebar from '$lib/components/layout/sidebar.svelte';
  import Toaster from '$lib/components/ui/sonner.svelte';

  import PathWarningBanner from '$lib/components/layout/path-warning-banner.svelte';
  import UpdateDialog from '$lib/components/UpdateDialog.svelte';
  import { checkForUpdates, type UpdateStatus } from '$lib/updater';
  import { onMount } from 'svelte';

  let { children } = $props();

  let updateAvailable: UpdateStatus | null = $state(null);
  let showUpdateDialog = $state(false);

  onMount(async () => {
    // Vérifier les mises à jour au démarrage (après 3 secondes)
    setTimeout(async () => {
      const update = await checkForUpdates();
      if (update.available) {
        updateAvailable = update;
        showUpdateDialog = true;
      }
    }, 3000);

    // Vérifier périodiquement (toutes les heures)
    setInterval(
      async () => {
        const update = await checkForUpdates();
        if (update.available) {
          updateAvailable = update;
          showUpdateDialog = true;
        }
      },
      60 * 60 * 1000,
    );
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<Toaster />
<Tooltip.Provider>
  {#if showUpdateDialog && updateAvailable}
    <UpdateDialog
      updateInfo={updateAvailable}
      onClose={() => (showUpdateDialog = false)}
    />
  {/if}

  <div
    class="flex h-screen w-screen overflow-hidden bg-background text-foreground"
  >
    <Sidebar />
    <div class="flex flex-1 flex-col overflow-hidden relative">
      <!-- Drag Region -->
      <div
        data-tauri-drag-region
        class="absolute top-0 left-0 right-0 h-8 z-[9999]"
      ></div>

      {@render children?.()}
      <PathWarningBanner />
    </div>
  </div>
</Tooltip.Provider>
