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
  import { saves, selectedSave } from '$lib/stores/saves';
  import * as Select from '$lib/components/ui/select';
  import * as Tabs from '$lib/components/ui/tabs';
  import { toast } from '$lib/stores/toast';

  let mods = $state<Mod[]>([]);
  let worlds = $state<Mod[]>([]);
  let searchQuery = $state('');
  let worldSearchQuery = $state('');
  let loading = $state(true);
  let worldsLoading = $state(false);
  let activeTab = $state('mods');

  // Bind to the selected save path
  let selectedSavePath = $state($selectedSave?.path || '');

  // Derive the trigger content for the select
  const triggerContent = $derived(
    $saves.find((s) => s.path === selectedSavePath)?.name ?? 'Select a save...',
  );

  // Sync selectedSavePath with store changes
  $effect(() => {
    if (selectedSavePath) {
      const save = $saves.find((s) => s.path === selectedSavePath);
      if (save && save.path !== $selectedSave?.path) {
        selectedSave.set(save);
      }
    }
  });

  // Sync when selectedSave changes externally
  $effect(() => {
    if ($selectedSave && $selectedSave.path !== selectedSavePath) {
      selectedSavePath = $selectedSave.path;
    }
  });

  let debounceTimer: ReturnType<typeof setTimeout>;
  let worldDebounceTimer: ReturnType<typeof setTimeout>;

  // Initial load
  onMount(async () => {
    await fetchMods();
  });

  $effect(() => {
    if (activeTab === 'worlds' && worlds.length === 0 && !worldsLoading) {
      fetchWorlds();
    }
  });

  async function fetchMods() {
    loading = true;
    try {
      // Default to PLUGIN type for mods
      mods = await modManager.searchMods({
        query: searchQuery,
        type: 'PLUGIN',
      });
    } catch (error) {
      console.error('Error loading mods:', error);
    } finally {
      loading = false;
    }
  }

  async function fetchWorlds() {
    worldsLoading = true;
    try {
      worlds = await modManager.searchMods({
        query: worldSearchQuery,
        type: 'WORLD',
      });
    } catch (error) {
      console.error('Error loading worlds:', error);
    } finally {
      worldsLoading = false;
    }
  }

  $effect(() => {
    // React to search query changes with debounce
    const query = searchQuery;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchMods();
    }, 500);

    return () => clearTimeout(debounceTimer);
  });

  $effect(() => {
    // React to world search query changes with debounce
    const query = worldSearchQuery;

    clearTimeout(worldDebounceTimer);
    worldDebounceTimer = setTimeout(() => {
      if (activeTab === 'worlds') {
        fetchWorlds();
      }
    }, 500);

    return () => clearTimeout(worldDebounceTimer);
  });

  async function handleInstall(
    modId: string,
    source: ModSource,
    version: string,
  ) {
    if (!$selectedSave) {
      toast.warning('Please select a save first');
      return;
    }

    try {
      // Use modManager to install
      await modManager.installMod(modId, source, version, $selectedSave.path);
      toast.success(
        'Item installed',
        `Successfully installed to ${$selectedSave.name}`,
      );
    } catch (e) {
      console.error('Install failed:', e);
      toast.error('Installation failed', String(e));
    }
  }

  function getRefUrl(source: ModSource) {
    if (source === ModSource.ORBIS) return 'Orbis';
    return source;
  }
</script>

<div class="flex flex-1 flex-col overflow-hidden">
  <main class="flex-1 overflow-y-auto p-8 custom-scrollbar">
    <div class="mx-auto max-w-7xl space-y-8">
      <!-- Header -->
      <div class="flex items-end justify-between">
        <div>
          <h1 class="text-4xl font-bold font-hebden text-[#c7f4fa]">Browse</h1>
          <p class="mt-2 text-[#c7f4fa]/70 font-nunito text-lg">
            Discover and install mods and worlds for your Hytale saves
          </p>
        </div>

        <!-- Save Selector (Global) -->
        <div class="flex items-center gap-3">
          <span
            class="text-xs font-hebden text-[#c7f4fa]/50 uppercase tracking-wider"
            >Install to:</span
          >
          <div class="w-64">
            <Select.Root type="single" bind:value={selectedSavePath}>
              <Select.Trigger
                class="h-11 w-full bg-white/5 border-white/10 text-white font-nunito hover:bg-white/10"
              >
                {triggerContent}
              </Select.Trigger>
              <Select.Content class="bg-[#06363d] border-[#084b54] text-white">
                {#each $saves as save}
                  <Select.Item
                    value={save.path}
                    label={save.name}
                    class="hover:bg-[#109eb1]/20 focus:bg-[#109eb1]/20 cursor-pointer text-white data-[highlighted]:bg-[#109eb1]/20"
                  >
                    {save.name}
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </div>

      <Tabs.Root value="mods" class="space-y-6">
        <Tabs.List
          class="bg-[#032125] border border-[#084b54] p-1 rounded-xl w-[300px] grid grid-cols-2 h-auto"
        >
          <Tabs.Trigger
            value="mods"
            class="h-10 rounded-lg font-hebden text-xs uppercase tracking-wider data-[state=active]:bg-[#109eb1] data-[state=active]:text-white text-[#c7f4fa]/70 hover:text-[#c7f4fa] transition-all flex items-center justify-center"
          >
            Mods
          </Tabs.Trigger>
          <Tabs.Trigger
            value="worlds"
            class="h-10 rounded-lg font-hebden text-xs uppercase tracking-wider data-[state=active]:bg-[#109eb1] data-[state=active]:text-white text-[#c7f4fa]/70 hover:text-[#c7f4fa] transition-all flex items-center justify-center"
          >
            Worlds
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="mods" class="space-y-6 outline-none">
          <!-- Search and Filters for Mods -->
          <div class="flex gap-4 items-center">
            <div class="relative flex-1 group">
              <Search
                class="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <Input
                type="text"
                bind:value={searchQuery}
                placeholder="Search mods..."
                class="pl-11 h-11 bg-white/5 border-white/10 rounded-full text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary/50 font-nunito"
              />
            </div>
          </div>

          <!-- Mods Grid -->
          {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
              <Spinner class="mb-4 size-10 text-primary" />
              <p
                class="text-lg text-muted-foreground font-hebden animate-pulse"
              >
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
                          <!-- Source Badge/Icon -->
                          <div class="flex items-center">
                            {#if mod.source === ModSource.ORBIS}
                              <img
                                src="/orbis_icon.png"
                                alt="Orbis"
                                class="size-5 object-contain"
                                title="Orbis"
                              />
                            {:else}
                              <Badge
                                variant="outline"
                                class="text-[9px] h-4 px-1 border-white/10 text-muted-foreground"
                              >
                                {getRefUrl(mod.source)}
                              </Badge>
                            {/if}
                          </div>
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
                      onclick={() =>
                        handleInstall(mod.id, mod.source, mod.version)}
                    >
                      <Download class="mr-2 size-4" />
                      Add Mod
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Tabs.Content>

        <Tabs.Content value="worlds" class="space-y-6 outline-none">
          <!-- Search and Filters for Worlds -->
          <div class="flex gap-4 items-center">
            <div class="relative flex-1 group">
              <Search
                class="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <Input
                type="text"
                bind:value={worldSearchQuery}
                placeholder="Search worlds..."
                class="pl-11 h-11 bg-white/5 border-white/10 rounded-full text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary/50 font-nunito"
              />
            </div>
          </div>

          <!-- Worlds Grid -->
          {#if worldsLoading}
            <div class="flex flex-col items-center justify-center py-20">
              <Spinner class="mb-4 size-10 text-primary" />
              <p
                class="text-lg text-muted-foreground font-hebden animate-pulse"
              >
                Loading worlds...
              </p>
            </div>
          {:else if worlds.length === 0}
            <div
              class="flex flex-col items-center justify-center py-20 text-muted-foreground"
            >
              <Globe class="size-16 mb-4 opacity-20" />
              <p class="text-lg font-hebden">No worlds found</p>
            </div>
          {:else}
            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {#each worlds as world}
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
                      {#if world.icon}
                        <img
                          src={world.icon}
                          alt={world.name}
                          class="w-full h-full object-cover"
                        />
                      {:else}
                        <Globe class="size-10 text-[#c7f4fa]/20" />
                      {/if}
                    </div>

                    <div class="flex-1 flex flex-col min-w-0">
                      <!-- Title & Author -->
                      <div class="flex-1 min-w-0 mb-1">
                        <div class="flex justify-between items-start gap-2">
                          <h3
                            class="font-hebden font-semibold text-lg leading-tight text-[#c7f4fa] truncate mb-0.5 group-hover:text-primary transition-colors"
                          >
                            {world.name}
                          </h3>
                          <!-- Source Badge/Icon -->
                          <div class="flex items-center">
                            <img
                              src="/orbis_icon.png"
                              alt="Orbis"
                              class="size-5 object-contain"
                              title="Orbis"
                            />
                          </div>
                        </div>

                        <p
                          class="font-hebden font-semibold text-xs text-[#c7f4fa]/50"
                        >
                          by <span
                            class="text-[#109eb1] hover:underline cursor-pointer"
                            >{world.author}</span
                          >
                        </p>
                      </div>

                      <!-- Description -->
                      <p
                        class="font-nunito text-xs leading-relaxed text-[#c7f4fa]/70 line-clamp-2 mb-3 h-8"
                      >
                        {@html world.description}
                      </p>

                      <!-- Tags -->
                      <div class="flex flex-wrap gap-1.5">
                        {#each world.categories.slice(0, 3) as category}
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
                          >{world.downloads.toLocaleString()}</span
                        >
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="default"
                      onclick={() =>
                        handleInstall(world.id, world.source, world.version)}
                    >
                      <Download class="mr-2 size-4" />
                      Add World
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  </main>
</div>
