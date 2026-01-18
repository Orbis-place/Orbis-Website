<script lang="ts">
  import { page } from '$app/stores';
  import { modManager } from '$lib/services/mod-manager';
  import { onMount, tick } from 'svelte';
  import {
    ModSource,
    type ModDetails,
    type ModVersion,
    type Mod,
    type ResourceComment,
    type ModpackModEntry,
  } from '$lib/types/mod';
  import { Spinner } from '$lib/components/ui/spinner';
  import TiptapViewer from '$lib/components/ui/tiptap-viewer.svelte';
  import CommentsList from '$lib/components/resource/comments-list.svelte';
  import ModpackEntryList from '$lib/components/resource/modpack-entry-list.svelte';
  import {
    ArrowLeft,
    Check,
    ChevronsUpDown,
    Globe,
    Download,
  } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import * as Tabs from '$lib/components/ui/tabs';
  import { saves, selectedSave } from '$lib/stores/saves';
  import { toast } from '$lib/stores/toast';
  import { cn } from '$lib/utils';
  import * as Popover from '$lib/components/ui/popover';
  import * as Command from '$lib/components/ui/command';
  import { OrbisModSource } from '$lib/services/sources/orbis-source';

  const { type, id } = $page.params;
  let resource = $state<ModDetails | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Comments State
  let comments = $state<ResourceComment[]>([]);
  let commentsPage = $state(1);
  let commentsTotal = $state(0);
  let commentsTotalPages = $state(0);
  let commentsLoading = $state(false);

  // Modpack Entries State
  let modpackEntries = $state<ModpackModEntry[]>([]);
  let modpackEntriesLoading = $state(false);

  // Install State
  let comboOpen = $state(false);
  let installTarget = $state<string>($selectedSave?.path || 'global');
  let triggerRef = $state<HTMLButtonElement>(null!);

  const selectedLabel = $derived(() => {
    if (installTarget === 'global') return 'Global Mods';
    return (
      $saves.find((s) => s.path === installTarget)?.name ?? 'Select target...'
    );
  });

  $effect(() => {
    if (installTarget && installTarget !== 'global') {
      const save = $saves.find((s) => s.path === installTarget);
      if (save && save.path !== $selectedSave?.path) {
        selectedSave.set(save);
      }
    }
  });

  function closeAndFocusTrigger() {
    comboOpen = false;
    tick().then(() => {
      triggerRef?.focus();
    });
  }

  async function handleInstall(mod: Mod) {
    if (!installTarget) {
      toast.warning('Please select an install target');
      return;
    }

    try {
      if (installTarget === 'global') {
        await modManager.installModGlobal(mod);
        toast.success(
          'Item installed',
          'Successfully installed to Global Mods',
        );
      } else {
        await modManager.installMod(mod, installTarget);
        const saveName =
          $saves.find((s) => s.path === installTarget)?.name ?? 'save';
        toast.success(
          'Item installed',
          `Successfully installed to ${saveName}`,
        );
      }
    } catch (e) {
      console.error('Install failed:', e);
      toast.error('Installation failed', String(e));
    }
  }

  async function handleInstallVersion(version: ModVersion) {
    if (!resource) return;
    // Create a temporary mod object with the specific version
    const targetMod: Mod = { ...resource, version: version.version };
    await handleInstall(targetMod);
  }

  async function fetchComments(page: number) {
    if (!resource || resource.source !== ModSource.ORBIS) return;

    commentsLoading = true;
    try {
      // We need to access the source directly or add a method to modManager
      // For now, let's cast or find the source instance
      const source = new OrbisModSource(); // This is a bit hacky, normally should get from manager
      const res = await source.getResourceComments(resource.id, page);
      comments = res.data;
      commentsTotal = res.meta.total;
      commentsTotalPages = res.meta.totalPages;
      commentsPage = page;
    } catch (e) {
      console.error('Failed to fetch comments', e);
    } finally {
      commentsLoading = false;
    }
  }

  async function fetchModpackEntries() {
    if (!resource || resource.source !== ModSource.ORBIS || type !== 'modpack')
      return;

    const res = resource;
    modpackEntriesLoading = true;
    try {
      const source = new OrbisModSource();
      // Find the version ID matching the current version
      const versionObj =
        res.versions.find((v) => v.version === res.version) || res.versions[0];

      if (versionObj?.id) {
        modpackEntries = await source.getModpackEntries(res.id, versionObj.id);
      }
    } catch (e) {
      console.error('Failed fetch modpack entries', e);
    } finally {
      modpackEntriesLoading = false;
    }
  }

  onMount(async () => {
    try {
      // Assuming source is Orbis
      const source = $page.url.searchParams.get('source') || ModSource.ORBIS;
      resource = await modManager.getModDetails(id, source);

      if (resource && source === ModSource.ORBIS) {
        fetchComments(1);
        if (type === 'modpack') {
          fetchModpackEntries();
        }
      }
    } catch (e) {
      console.error('Failed to load resource details:', e);
      error = String(e);
    } finally {
      loading = false;
    }
  });
</script>

<div class="flex flex-1 flex-col overflow-hidden bg-[#032125]">
  {#if loading}
    <div class="flex flex-1 items-center justify-center">
      <Spinner class="size-10 text-[#109eb1]" />
    </div>
  {:else if error}
    <div class="flex flex-1 items-center justify-center text-red-400">
      Error: {error}
    </div>
  {:else if resource}
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- Header Section -->
      <div class="relative w-full bg-[#06363d] border-b border-[#084b54]">
        <!-- Banner -->
        {#if resource.screenshots?.[0]}
          <div
            class="absolute inset-0 w-full h-full overflow-hidden opacity-50 pointer-events-none"
          >
            <img
              src={resource.screenshots[0]}
              alt="Banner"
              class="w-full h-full object-cover blur-sm"
            />
            <div
              class="absolute inset-0 bg-gradient-to-b from-[#06363d]/0 via-[#06363d]/50 to-[#06363d]"
            ></div>
          </div>
        {/if}

        <div class="relative mx-auto px-8 pt-6 pb-12">
          <Button
            variant="ghost"
            size="sm"
            class="mb-6 text-[#c7f4fa]/70 hover:text-[#c7f4fa] hover:bg-[#c7f4fa]/10 pl-0"
            onclick={() => goto('/')}
          >
            <ArrowLeft class="mr-2 size-4" />
            Back to Browse
          </Button>

          <div class="flex gap-8 items-start">
            <!-- Icon -->
            <div
              class="size-32 rounded-[25px] overflow-hidden bg-[#032125] border border-[#084b54] flex-shrink-0"
            >
              {#if resource.icon}
                <img
                  src={resource.icon}
                  alt={resource.name}
                  class="w-full h-full object-cover"
                />
              {:else}
                <div
                  class="w-full h-full flex items-center justify-center font-hebden text-4xl text-[#c7f4fa]"
                >
                  {resource.name.substring(0, 2).toUpperCase()}
                </div>
              {/if}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 pt-2">
              <h1 class="text-4xl font-bold font-hebden text-[#c7f4fa] mb-2">
                {resource.name}
              </h1>
              <div
                class="flex items-center gap-2 text-[#c7f4fa]/70 font-nunito text-lg mb-6"
              >
                <span
                  >by <span class="text-[#109eb1] font-semibold"
                    >{resource.author}</span
                  ></span
                >
              </div>

              <!-- Stats Row -->
              <!-- TODO: Add stats and buttons here -->
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 py-8 flex gap-8">
        <!-- Main Content -->
        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <Tabs.Root value="overview" class="w-full">
            <Tabs.List
              class="bg-transparent border-b border-[#084b54] w-full justify-start rounded-none p-0 h-auto mb-6"
            >
              <Tabs.Trigger
                value="overview"
                class="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-[#109eb1] data-[state=active]:text-[#109eb1] text-[#c7f4fa]/60 hover:text-[#c7f4fa] rounded-none px-4 py-3 font-hebden tracking-wide transition-all"
              >
                Overview
              </Tabs.Trigger>
              {#if type === 'modpack'}
                <Tabs.Trigger
                  value="modpack-mods"
                  class="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-[#109eb1] data-[state=active]:text-[#109eb1] text-[#c7f4fa]/60 hover:text-[#c7f4fa] rounded-none px-4 py-3 font-hebden tracking-wide transition-all"
                >
                  Mods
                </Tabs.Trigger>
              {/if}
              <Tabs.Trigger
                value="versions"
                class="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-[#109eb1] data-[state=active]:text-[#109eb1] text-[#c7f4fa]/60 hover:text-[#c7f4fa] rounded-none px-4 py-3 font-hebden tracking-wide transition-all"
              >
                Versions
              </Tabs.Trigger>
              <Tabs.Trigger
                value="gallery"
                class="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-[#109eb1] data-[state=active]:text-[#109eb1] text-[#c7f4fa]/60 hover:text-[#c7f4fa] rounded-none px-4 py-3 font-hebden tracking-wide transition-all"
              >
                Gallery
              </Tabs.Trigger>
              <Tabs.Trigger
                value="comments"
                class="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-[#109eb1] data-[state=active]:text-[#109eb1] text-[#c7f4fa]/60 hover:text-[#c7f4fa] rounded-none px-4 py-3 font-hebden tracking-wide transition-all"
              >
                Comments
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview" class="outline-none">
              <div
                class="prose prose-invert max-w-none prose-p:text-[#c7f4fa]/80 prose-headings:text-[#c7f4fa] prose-a:text-[#109eb1]"
              >
                <TiptapViewer
                  content={resource.longDescription || resource.description}
                />
              </div>
            </Tabs.Content>

            <Tabs.Content value="versions" class="outline-none">
              <div class="space-y-4">
                {#each resource.versions as version}
                  <div
                    class="p-4 bg-[#06363d] border border-[#084b54] rounded-xl flex justify-between items-start group hover:border-[#109eb1]/50 transition-colors gap-4"
                  >
                    <div>
                      <div class="flex items-center gap-3 mb-1">
                        <span class="font-hebden text-[#c7f4fa]"
                          >{version.version}</span
                        >
                        <span class="text-xs text-[#c7f4fa]/40 font-nunito"
                          >{new Date(
                            version.releaseDate || '',
                          ).toLocaleDateString()}</span
                        >
                      </div>
                      {#if version.changelog}
                        <div
                          class="mt-2 prose prose-invert max-w-none prose-p:text-[#c7f4fa]/60 prose-headings:text-[#c7f4fa]/80 prose-a:text-[#109eb1] prose-sm"
                        >
                          <TiptapViewer content={version.changelog} />
                        </div>
                      {/if}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      class="border-[#109eb1] text-[#109eb1] hover:bg-[#109eb1] hover:text-white"
                      onclick={() => handleInstallVersion(version)}
                    >
                      Install
                    </Button>
                  </div>
                {/each}
              </div>
            </Tabs.Content>

            <Tabs.Content value="gallery" class="outline-none">
              {#if resource.screenshots && resource.screenshots.length > 0}
                <div class="grid grid-cols-2 gap-4">
                  {#each resource.screenshots as screenshot}
                    <div
                      class="aspect-video rounded-xl overflow-hidden border border-[#084b54] bg-[#032125]"
                    >
                      <img
                        src={screenshot}
                        alt="Gallery"
                        class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="text-center py-12 text-[#c7f4fa]/40 font-hebden">
                  No images available
                </div>
              {/if}
            </Tabs.Content>

            <Tabs.Content value="modpack-mods" class="outline-none">
              <ModpackEntryList entries={modpackEntries} />
            </Tabs.Content>

            <Tabs.Content value="comments" class="outline-none">
              <CommentsList
                {comments}
                total={commentsTotal}
                totalPages={commentsTotalPages}
                page={commentsPage}
                isLoading={commentsLoading}
                onPageChange={fetchComments}
              />
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <!-- Sidebar -->
        <div class="w-80 flex-shrink-0 space-y-6">
          <!-- Download Button Block -->
          <div
            class="p-6 bg-[#06363d] border border-[#084b54] rounded-2xl flex flex-col gap-4"
          >
            <h3 class="font-hebden text-lg text-[#c7f4fa]">Install</h3>

            <!-- Target Selector -->
            <div class="flex flex-col gap-2">
              <span
                class="text-xs font-hebden text-[#c7f4fa]/50 uppercase tracking-wider"
                >Target</span
              >
              <Popover.Root bind:open={comboOpen}>
                <Popover.Trigger bind:ref={triggerRef}>
                  {#snippet child({ props })}
                    <Button
                      variant="outline"
                      class="w-full justify-between h-10 border border-[#084b54] text-[#c7f4fa] bg-[#084b54]/20 font-nunito hover:bg-[#084b54]/40 hover:border-[#109eb1]/50 rounded-xl"
                      {...props}
                      role="combobox"
                      aria-expanded={comboOpen}
                    >
                      <span class="flex items-center gap-2 truncate">
                        {#if installTarget === 'global'}
                          <Globe class="size-4 text-[#109eb1]" />
                        {/if}
                        {selectedLabel()}
                      </span>
                      <ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  {/snippet}
                </Popover.Trigger>
                <Popover.Content
                  class="w-[280px] p-1 bg-[#06363d] border border-[#084b54] rounded-xl shadow-xl z-[100]"
                >
                  <Command.Root class="bg-transparent">
                    <Command.Input
                      placeholder="Search saves..."
                      class="h-9 text-[#c7f4fa] bg-transparent border-0 focus:ring-0"
                    />
                    <Command.List class="max-h-64 custom-scrollbar">
                      <Command.Empty
                        class="text-white/50 py-4 text-center text-sm"
                        >No results found.</Command.Empty
                      >
                      <Command.Group>
                        <div
                          class="px-2 py-1.5 text-xs font-semibold text-[#c7f4fa]/50 uppercase tracking-wider"
                        >
                          Global
                        </div>
                        <Command.Item
                          value="global"
                          onSelect={() => {
                            installTarget = 'global';
                            closeAndFocusTrigger();
                          }}
                          class="text-[#c7f4fa] cursor-pointer rounded-sm px-2 py-1.5 data-[selected]:bg-[#109eb1]/20 hover:bg-[#109eb1]/10"
                        >
                          <Check
                            class={cn(
                              'mr-2 size-4',
                              installTarget !== 'global' && 'text-transparent',
                            )}
                          />
                          <Globe class="mr-2 size-4 text-[#109eb1]" />
                          Global Mods
                        </Command.Item>
                      </Command.Group>
                      <div class="h-px bg-[#084b54] mx-1 my-1"></div>
                      <Command.Group>
                        <div
                          class="px-2 py-1.5 text-xs font-semibold text-[#c7f4fa]/50 uppercase tracking-wider"
                        >
                          Saves
                        </div>
                        {#each $saves as save}
                          <Command.Item
                            value={save.path}
                            onSelect={() => {
                              installTarget = save.path;
                              closeAndFocusTrigger();
                            }}
                            class="text-[#c7f4fa] cursor-pointer rounded-sm px-2 py-1.5 data-[selected]:bg-[#109eb1]/20 hover:bg-[#109eb1]/10"
                          >
                            <Check
                              class={cn(
                                'mr-2 size-4',
                                installTarget !== save.path &&
                                  'text-transparent',
                              )}
                            />
                            {save.name}
                          </Command.Item>
                        {/each}
                      </Command.Group>
                    </Command.List>
                  </Command.Root>
                </Popover.Content>
              </Popover.Root>
            </div>

            <Button
              size="lg"
              class="w-full font-hebden tracking-wide bg-[#109eb1] hover:bg-[#109eb1]/90 text-white shadow-lg shadow-[#109eb1]/20"
              onclick={() => resource && handleInstall(resource)}
            >
              <Download class="mr-2 size-5" />
              Install
            </Button>
          </div>

          <!-- Details Block -->
          <div
            class="p-6 bg-[#06363d] border border-[#084b54] rounded-2xl space-y-4"
          >
            <h3 class="font-hebden text-lg text-[#c7f4fa] mb-4">Details</h3>

            <div
              class="flex justify-between items-center py-2 border-b border-[#084b54]/50"
            >
              <span class="text-[#c7f4fa]/50 font-nunito">Version</span>
              <span class="text-[#c7f4fa] font-semibold"
                >{resource.version}</span
              >
            </div>
            <div
              class="flex justify-between items-center py-2 border-b border-[#084b54]/50"
            >
              <span class="text-[#c7f4fa]/50 font-nunito">Downloads</span>
              <span class="text-[#c7f4fa] font-semibold"
                >{resource.downloads.toLocaleString()}</span
              >
            </div>

            {#if resource.license}
              <div
                class="flex justify-between items-center py-2 border-b border-[#084b54]/50"
              >
                <span class="text-[#c7f4fa]/50 font-nunito">License</span>
                <span
                  class="text-[#c7f4fa] font-semibold truncate max-w-[150px]"
                  >{resource.license}</span
                >
              </div>
            {/if}
          </div>

          <!-- Categories -->
          {#if resource.categories && resource.categories.length > 0}
            <div class="p-6 bg-[#06363d] border border-[#084b54] rounded-2xl">
              <h3 class="font-hebden text-lg text-[#c7f4fa] mb-4">
                Categories
              </h3>
              <div class="flex flex-wrap gap-2">
                {#each resource.categories as category}
                  <span
                    class="px-3 py-1 rounded-lg bg-[#109eb1]/20 text-[#109eb1] border border-[#109eb1]/30 text-xs font-bold uppercase tracking-wider"
                  >
                    {category}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="flex flex-1 items-center justify-center text-muted-foreground">
      Resource not found
    </div>
  {/if}
</div>
