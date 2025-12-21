<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import Icon from "@iconify/svelte";
  import { Button } from "$lib/components/ui/button";

  // Navigation history tracking
  let historyStack = $state<string[]>([]);
  let historyIndex = $state(0);
  let navigationDirection = $state<"back" | "forward" | null>(null);

  let canGoBack = $derived(historyIndex > 0);
  let canGoForward = $derived(historyIndex < historyStack.length - 1);

  afterNavigate(({ to, type }) => {
    if (!to?.url) return;

    const path = to.url.pathname;

    // Handle back/forward navigation
    if (navigationDirection === "back") {
      navigationDirection = null;
      return;
    }
    if (navigationDirection === "forward") {
      navigationDirection = null;
      return;
    }

    // Check if this is a popstate (browser back/forward without our buttons)
    if (type === "popstate") {
      const existingIndex = historyStack.indexOf(path);
      if (existingIndex !== -1) {
        historyIndex = existingIndex;
        return;
      }
    }

    // New navigation: truncate forward history and add new entry
    if (historyStack.length === 0) {
      historyStack = [path];
      historyIndex = 0;
    } else {
      historyStack = [...historyStack.slice(0, historyIndex + 1), path];
      historyIndex = historyStack.length - 1;
    }
  });

  function goBack() {
    if (canGoBack) {
      navigationDirection = "back";
      historyIndex--;
      history.back();
    }
  }

  function goForward() {
    if (canGoForward) {
      navigationDirection = "forward";
      historyIndex++;
      history.forward();
    }
  }
</script>

<div class="flex items-center gap-1">
  <Button
    variant="ghost"
    size="icon"
    onclick={goBack}
    disabled={!canGoBack}
    class="h-8 w-8 rounded-lg transition-all {canGoBack
      ? 'text-foreground/60 hover:bg-secondary/60 hover:text-foreground'
      : 'text-foreground/20 cursor-not-allowed'}"
    aria-label="Précédent"
  >
    <Icon icon="lucide:chevron-left" width={18} />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onclick={goForward}
    disabled={!canGoForward}
    class="h-8 w-8 rounded-lg transition-all {canGoForward
      ? 'text-foreground/60 hover:bg-secondary/60 hover:text-foreground'
      : 'text-foreground/20 cursor-not-allowed'}"
    aria-label="Suivant"
  >
    <Icon icon="lucide:chevron-right" width={18} />
  </Button>
</div>
