<script lang="ts">
  import { Toaster } from 'svelte-sonner';
  import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
  } from 'lucide-svelte';
</script>

<Toaster
  position="bottom-right"
  theme="dark"
  closeButton
  toastOptions={{
    unstyled: true,
    classes: {
      toast:
        'flex items-center gap-3 w-full p-4 rounded-xl border shadow-lg font-nunito',
      title: 'font-semibold text-sm',
      description: 'text-xs opacity-80 mt-1',
      actionButton: 'px-3 py-1.5 rounded-lg text-xs font-semibold ml-auto',
      cancelButton: 'px-3 py-1.5 rounded-lg text-xs font-semibold',
      closeButton:
        'absolute right-2 top-2 p-1 rounded-md hover:bg-white/10 transition-colors',
      success: 'bg-[#10b981]/10 border-[#10b981] text-[#c7f4fa]',
      error: 'bg-red-500/10 border-red-500 text-[#c7f4fa]',
      warning: 'bg-[#f59e0b]/10 border-[#f59e0b] text-[#c7f4fa]',
      info: 'bg-[#109eb1]/10 border-[#109eb1] text-[#c7f4fa]',
      default: 'bg-[#032125] border-[#084b54] text-[#c7f4fa]',
    },
  }}
>
  {#snippet loadingIcon()}
    <Loader2Icon class="size-5 animate-spin text-[#109eb1]" />
  {/snippet}
  {#snippet successIcon()}
    <CircleCheckIcon class="size-5 text-[#10b981]" />
  {/snippet}
  {#snippet errorIcon()}
    <OctagonXIcon class="size-5 text-red-500" />
  {/snippet}
  {#snippet infoIcon()}
    <InfoIcon class="size-5 text-[#109eb1]" />
  {/snippet}
  {#snippet warningIcon()}
    <TriangleAlertIcon class="size-5 text-[#f59e0b]" />
  {/snippet}
</Toaster>
