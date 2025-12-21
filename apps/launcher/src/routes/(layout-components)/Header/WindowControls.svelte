<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import Icon from "@iconify/svelte";
  import { Button } from "$lib/components/ui/button";

  let isMaximized = $state(false);
  const appWindow = getCurrentWindow();

  // Check initial maximized state
  appWindow.isMaximized().then((maximized) => {
    isMaximized = maximized;
  });

  // Listen for maximize/unmaximize events
  appWindow.onResized(async () => {
    isMaximized = await appWindow.isMaximized();
  });

  async function minimize() {
    await appWindow.minimize();
  }

  async function toggleMaximize() {
    await appWindow.toggleMaximize();
  }

  async function close() {
    await appWindow.close();
  }
</script>

<div class="flex h-full gap-1 pr-2">
  <Button
    variant="ghost"
    size="icon"
    onclick={minimize}
    class="h-8 w-10 my-auto text-foreground/60 rounded-lg hover:bg-secondary/60"
    aria-label="Minimize"
  >
    <Icon icon="lucide:minus" width={16} />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onclick={toggleMaximize}
    class="h-8 w-10 my-auto text-foreground/60 rounded-lg hover:bg-secondary/60"
    aria-label={isMaximized ? "Restore" : "Maximize"}
  >
    {#if isMaximized}
      <Icon icon="lucide:minimize-2" width={14} />
    {:else}
      <Icon icon="lucide:maximize-2" width={14} />
    {/if}
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onclick={close}
    class="h-8 w-10 my-auto text-foreground/60 rounded-lg hover:bg-destructive/80 hover:text-destructive-foreground"
    aria-label="Close"
  >
    <Icon icon="lucide:x" width={16} />
  </Button>
</div>
