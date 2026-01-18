<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import {
    Package,
    Puzzle,
    FileCode,
    ArrowRight,
    Tag,
    Cog,
  } from 'lucide-svelte';
  import type { ModpackModEntry } from '$lib/types/mod';
  import { Button } from '$lib/components/ui/button';

  export let entries: ModpackModEntry[] = [];

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
</script>

<div class="space-y-6">
  <div class="bg-[#06363d] border border-[#084b54] rounded-2xl p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="font-hebden text-xl font-bold text-[#c7f4fa]">Mods</h2>
        <p class="text-[#c7f4fa]/70 font-nunito text-sm mt-1">
          This modpack includes {entries.length}
          {entries.length === 1 ? 'mod' : 'mods'}
        </p>
      </div>
      {#if entries.length > 0}
        <Badge
          variant="secondary"
          class="bg-[#109eb1]/20 text-[#109eb1] border-[#109eb1]/30"
        >
          {entries.length} Mods
        </Badge>
      {/if}
    </div>

    {#if entries.length === 0}
      <div
        class="text-center py-12 bg-[#032125] rounded-xl border border-[#084b54]"
      >
        <Package class="w-12 h-12 mx-auto mb-4 text-[#c7f4fa]/20" />
        <p class="text-[#c7f4fa] font-nunito text-lg mb-2">No mods yet</p>
        <p class="text-[#c7f4fa]/50 font-nunito text-sm">
          This modpack doesn't have any mods configured.
        </p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each entries as entry}
          {@const isPlatformMod = !!entry.modVersionId && !!entry.modVersion}
          {@const isCustomMod = !!entry.customModName}
          {@const modName = isPlatformMod
            ? entry.modVersion?.resource.name
            : entry.customModName}
          {@const modVersion = isPlatformMod
            ? entry.modVersion?.versionNumber
            : entry.customModVersion}
          {@const modIcon = isPlatformMod
            ? entry.modVersion?.resource.iconUrl
            : null}

          <div
            class="bg-[#032125] rounded-xl border border-[#084b54] p-4 flex items-center gap-4 hover:border-[#109eb1]/30 transition-colors"
          >
            <!-- Icon -->
            <div class="flex-shrink-0">
              {#if modIcon}
                <img
                  src={modIcon}
                  alt={modName || 'Mod'}
                  class="w-12 h-12 rounded-lg object-cover"
                />
              {:else}
                <div
                  class="w-12 h-12 rounded-lg bg-[#06363d] flex items-center justify-center border border-[#084b54]"
                >
                  {#if isCustomMod}
                    <FileCode class="w-6 h-6 text-[#c7f4fa]/50" />
                  {:else}
                    <Puzzle class="w-6 h-6 text-[#c7f4fa]/50" />
                  {/if}
                </div>
              {/if}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-nunito font-semibold text-[#c7f4fa] truncate">
                  {modName}
                </span>
                {#if isCustomMod}
                  <Badge
                    variant="outline"
                    class="text-xs border-[#084b54] text-[#c7f4fa]/70"
                    >Custom</Badge
                  >
                {/if}
              </div>

              <div
                class="flex items-center gap-3 text-sm text-[#c7f4fa]/50 mt-1"
              >
                {#if modVersion}
                  <span class="flex items-center gap-1">
                    <Tag class="w-3.5 h-3.5" />
                    v{modVersion}
                  </span>
                {/if}
                {#if entry.config}
                  <span class="flex items-center gap-1 text-[#109eb1]">
                    <Cog class="w-3.5 h-3.5" />
                    Config included
                  </span>
                {/if}
                {#if entry.customModFile}
                  <span class="flex items-center gap-1">
                    <span class="font-mono text-xs"
                      >{formatBytes(entry.customModFile.size)}</span
                    >
                  </span>
                {/if}
              </div>
            </div>

            <!-- Action (Link if platform mod) -->
            {#if isPlatformMod && entry.modVersion?.resource?.slug}
              <!-- We could add a link to the mod details page, but let's just keep it simple for now -->
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
