<script lang="ts">
  import '../app.css';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import Sidebar from '$lib/components/layout/sidebar.svelte';

  let { children } = $props();
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

<Tooltip.Provider>
  <div
    class="flex h-screen w-screen overflow-hidden bg-background text-foreground"
  >
    <Sidebar />
    <div class="flex flex-1 flex-col overflow-hidden relative">
      <div
        class="absolute inset-0 bg-gradient-to-br from-[#109eb1]/5 via-transparent to-[#032125] pointer-events-none z-0"
      ></div>
      {@render children?.()}
    </div>
  </div>
</Tooltip.Provider>
