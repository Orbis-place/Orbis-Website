<script lang="ts">
  import Icon from "@iconify/svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";
</script>

<Tooltip.Provider>
  <div class="p-3 border-t border-border/50">
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <a
            {...props}
            href="/settings"
            class="flex items-center justify-center w-full h-12 rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <Icon icon="lucide:settings" width={20} class="text-foreground/60" />
          </a>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content side="right">
        <p>Paramètres</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </div>
</Tooltip.Provider>
