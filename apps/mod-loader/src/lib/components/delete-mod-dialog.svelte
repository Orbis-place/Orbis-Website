<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { AlertTriangle } from 'lucide-svelte';
  import type { InstalledMod } from '$lib/types/installed-mod';

  let {
    open = $bindable(false),
    mod,
    onConfirm,
  }: {
    open: boolean;
    mod: InstalledMod | null;
    onConfirm: () => void;
  } = $props();

  let isDeleting = $state(false);

  async function handleConfirm() {
    isDeleting = true;
    try {
      await onConfirm();
      open = false;
    } finally {
      isDeleting = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="bg-[#06363d] border-2 border-[#084b54] rounded-[25px] shadow-2xl shadow-primary/10 sm:max-w-md"
  >
    <Dialog.Header class="space-y-3 pb-4 border-b border-border/30">
      <Dialog.Title
        class="font-hebden text-2xl font-bold text-foreground flex items-center gap-3"
      >
        <span
          class="w-1 h-6 bg-gradient-to-b from-destructive to-destructive/50 rounded-full"
        ></span>
        Delete Mod
      </Dialog.Title>
      <Dialog.Description
        class="font-nunito text-sm text-muted-foreground/80 ml-4"
      >
        This action cannot be undone.
      </Dialog.Description>
    </Dialog.Header>

    <div class="py-4 font-nunito text-foreground/90">
      {#if mod}
        <div
          class="flex items-start gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20"
        >
          <AlertTriangle class="size-5 text-destructive flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-sm text-foreground/90 mb-2">
              Are you sure you want to delete <strong class="text-foreground"
                >{mod.manifest.Name}</strong
              >?
            </p>
            <p class="text-xs text-muted-foreground">
              The mod file will be permanently removed from your save directory.
            </p>
          </div>
        </div>
      {/if}
    </div>

    <div class="pt-4 border-t border-border/30 flex justify-end gap-3">
      <Button
        variant="outline"
        onclick={() => (open = false)}
        disabled={isDeleting}
        class="px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-border bg-secondary/30 hover:bg-secondary text-foreground"
      >
        Cancel
      </Button>
      <Button
        onclick={handleConfirm}
        disabled={isDeleting}
        class="px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-destructive bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      >
        {#if isDeleting}
          <svg
            class="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        {/if}
        Delete Mod
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
