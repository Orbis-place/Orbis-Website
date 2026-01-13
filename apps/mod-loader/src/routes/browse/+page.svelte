<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Spinner } from '$lib/components/ui/spinner';
  import { Package, Search, Filter, Download, Globe } from 'lucide-svelte';
  import { modManager } from '$lib/services/mod-manager';
  import { onMount } from 'svelte';
  import { ModSource, type Mod } from '$lib/types/mod';
  import { selectedSave } from '$lib/stores/saves';

  let mods = $state<Mod[]>([]);
  let searchQuery = $state('');
  let loading = $state(true);

  onMount(async () => {
    try {
      mods = await modManager.searchMods();
    } catch (error) {
      console.error('Error loading mods:', error);
    } finally {
      loading = false;
    }
  });

  async function handleInstall(
    modId: string,
    source: ModSource,
    version: string,
  ) {
    if (!$selectedSave) {
      alert('Please select a save from the sidebar first.');
      return;
    }

    try {
      // Use modManager to install
      await modManager.installMod(modId, source, version, $selectedSave.path);
      alert(`Successfully installed mod to ${$selectedSave.name}`);
    } catch (e) {
      console.error('Install failed:', e);
      alert(`Failed to install mod: ${e}`);
    }
  }

  function getRefUrl(source: ModSource) {
    if (source === ModSource.ORBIS) return 'Orbis';
    if (source === ModSource.CURSEFORGE) return 'CurseForge';
    return source;
  }
</script>

<div class="flex flex-1 flex-col overflow-hidden">
  <main class="flex-1 overflow-y-auto p-8 custom-scrollbar">
    <div class="mx-auto max-w-7xl space-y-8">
      <!-- Header -->
      <div class="flex items-end justify-between">
        <div>
          <h1 class="text-4xl font-bold font-hebden text-[#c7f4fa]">
            Browse Mods
          </h1>
          <p class="mt-2 text-[#c7f4fa]/70 font-nunito text-lg">
            Discover and install mods for your Hytale saves
          </p>
        </div>

        <!-- Search and Filters -->
        <div class="flex gap-4 items-center">
          <div class="relative w-80 group">
            <Search
              class="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
            />
            <Input
              type="text"
              bind:value={searchQuery}
              placeholder="Search marketplace..."
              class="pl-11 h-11 bg-white/5 border-white/10 rounded-full text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary/50 font-nunito"
            />
          </div>
          <Button
            variant="outline"
            class="h-11 rounded-1xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-primary gap-2 font-hebden text-xs uppercase tracking-wider"
          >
            <Filter class="size-4" />
            Filters
          </Button>
        </div>
      </div>

      <!-- Current Context Banner -->
      {#if $selectedSave}
        <div
          class="bg-[#109eb1]/10 border border-[#109eb1]/20 rounded-xl p-3 flex items-center gap-3"
        >
          <div
            class="size-2 rounded-full bg-[#109eb1] animate-pulse ml-2"
          ></div>
          <p class="text-sm font-nunito text-[#c7f4fa]">
            Installing to: <span class="font-bold text-[#109eb1]"
              >{$selectedSave.name}</span
            >
          </p>
        </div>
      {/if}

      <!-- Mods Grid -->
      {#if loading}
        <div class="flex flex-col items-center justify-center py-20">
          <Spinner class="mb-4 size-10 text-primary" />
          <p class="text-lg text-muted-foreground font-hebden animate-pulse">
            Loading mods...
          </p>
        </div>
      {:else if mods.length === 0}
        <div
          class="flex flex-col items-center justify-center py-20 text-muted-foreground"
        >
          <Package class="size-16 mb-4 opacity-20" />
          <p class="text-lg font-hebden">No mods found</p>
        </div>
      {:else}
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {#each mods as mod}
            <!-- Marketplace Style Card -->
            <div
              class="bg-[#06363d] border border-[#084b54] hover:border-[#109eb1] rounded-[25px] overflow-hidden flex flex-col min-h-[200px] transition-all duration-200 group relative"
            >
              <!-- Content -->
              <div class="flex gap-4 p-4">
                <!-- Icon -->
                <div
                  class="relative w-24 h-24 flex-shrink-0 rounded-[15px] overflow-hidden bg-[#032125] flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                >
                  {#if mod.icon}
                    <img
                      src={mod.icon}
                      alt={mod.name}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <span class="font-hebden text-4xl text-[#c7f4fa]"
                      >{mod.name.substring(0, 2).toUpperCase()}</span
                    >
                  {/if}
                </div>

                <div class="flex-1 flex flex-col min-w-0">
                  <!-- Title & Author -->
                  <div class="flex-1 min-w-0 mb-1">
                    <div class="flex justify-between items-start gap-2">
                      <h3
                        class="font-hebden font-semibold text-lg leading-tight text-[#c7f4fa] truncate mb-0.5 group-hover:text-primary transition-colors"
                      >
                        {mod.name}
                      </h3>
                      <!-- Source Badge -->
                      <Badge
                        variant="outline"
                        class="text-[9px] h-4 px-1 border-white/10 text-muted-foreground"
                      >
                        {getRefUrl(mod.source)}
                      </Badge>
                    </div>

                    <p
                      class="font-hebden font-semibold text-xs text-[#c7f4fa]/50"
                    >
                      by <span
                        class="text-[#109eb1] hover:underline cursor-pointer"
                        >{mod.author}</span
                      >
                    </p>
                  </div>

                  <!-- Description -->
                  <p
                    class="font-nunito text-xs leading-relaxed text-[#c7f4fa]/70 line-clamp-2 mb-3 h-8"
                  >
                    {@html mod.description}
                  </p>

                  <!-- Tags -->
                  <div class="flex flex-wrap gap-1.5">
                    {#each mod.categories.slice(0, 3) as category}
                      <span
                        class="px-2 py-0.5 rounded-[5px] font-nunito text-[11px] font-bold uppercase tracking-wider bg-[#109eb1]/20 text-[#109eb1] border border-[#109eb1]/30"
                      >
                        {category}
                      </span>
                    {/each}
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div
                class="flex justify-between items-center px-4 py-3 border-t border-[#084b54] bg-[#032125]/30 mt-auto"
              >
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1.5" title="Downloads">
                    <Download class="size-3.5 text-[#c7f4fa]/40" />
                    <span class="font-hebden text-xs text-[#c7f4fa]/50"
                      >{mod.downloads.toLocaleString()}</span
                    >
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  onclick={() => handleInstall(mod.id, mod.source, mod.version)}
                >
                  <Download class="mr-2 size-4" />
                  Add Mod
                </Button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </main>
</div>
