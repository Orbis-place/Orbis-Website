<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Globe, FolderOpen, Package, Trash2, RefreshCw } from 'lucide-svelte';
  import { onMount, onDestroy } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { openPath } from '@tauri-apps/plugin-opener';
  import { toast } from '$lib/stores/toast';
  import { settings } from '$lib/stores/settings';
  import { get } from 'svelte/store';
  import DeleteModDialog from '$lib/components/delete-mod-dialog.svelte';

  interface GlobalMod {
    jar_name: string;
    manifest: {
      Group: string;
      Name: string;
      Version: string;
      Description: string;
      Authors: Array<{ Name: string }>;
    };
    orbis_metadata?: {
      id: string;
      slug?: string;
      name: string;
      author: string;
      iconUrl?: string;
      version: string;
      installedAt: string;
    };
  }

  let globalMods = $state<GlobalMod[]>([]);
  let loading = $state(true);
  let pollInterval: ReturnType<typeof setInterval>;
  let globalModsPath = $state('');

  // Delete dialog state
  let deleteDialogOpen = $state(false);
  let modToDelete = $state<GlobalMod | null>(null);

  onMount(async () => {
    await loadGlobalMods();
    // Poll for updates every 10 seconds
    pollInterval = setInterval(loadGlobalMods, 10000);
  });

  onDestroy(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  });

  async function loadGlobalMods() {
    // Don't set loading=true for background polls
    if (globalMods.length === 0) {
      loading = true;
    }

    try {
      let hytaleRoot = get(settings).hytaleRoot;
      if (!hytaleRoot) {
        await settings.load();
        hytaleRoot = get(settings).hytaleRoot;
      }

      if (!hytaleRoot) {
        loading = false;
        return;
      }

      const { join } = await import('@tauri-apps/api/path');
      globalModsPath = await join(hytaleRoot, 'UserData', 'Mods');

      const mods = await invoke<GlobalMod[]>('get_global_mods', { hytaleRoot });
      globalMods = mods;
    } catch (error) {
      console.error('Failed to load global mods:', error);
    } finally {
      loading = false;
    }
  }

  function openDeleteDialog(mod: GlobalMod) {
    modToDelete = mod;
    deleteDialogOpen = true;
  }

  async function handleDeleteMod() {
    if (!modToDelete) return;

    const hytaleRoot = get(settings).hytaleRoot;
    if (!hytaleRoot) return;

    try {
      await invoke('delete_global_mod', {
        hytaleRoot,
        jarFilename: modToDelete.jar_name,
      });

      toast.success('Global mod deleted successfully');
      await loadGlobalMods();
    } catch (error) {
      console.error('Failed to delete global mod:', error);
      toast.error('Failed to delete mod', String(error));
      throw error;
    }
  }

  async function openGlobalModsFolder() {
    if (!globalModsPath) return;
    try {
      await openPath(globalModsPath);
    } catch (error) {
      console.error('Failed to open global mods folder:', error);
    }
  }
</script>

<div class="flex flex-col h-full bg-[#032125]">
  <!-- Header / Hero -->
  <div
    class="relative overflow-hidden border-b border-[#084b54] bg-[#06363d] p-8"
  >
    <div
      class="absolute inset-0 bg-gradient-to-r from-[#109eb1]/10 to-transparent opacity-50 pointer-events-none"
    ></div>
    <div
      class="absolute -right-20 -top-20 size-96 rounded-full bg-[#109eb1]/5 blur-[100px] pointer-events-none"
    ></div>

    <div class="relative z-10 flex items-start justify-between">
      <div class="flex gap-6">
        <!-- Icon -->
        <div
          class="size-24 rounded-2xl bg-gradient-to-br from-[#06363d] to-[#032125] border border-[#084b54] flex items-center justify-center shadow-2xl"
        >
          <Globe class="size-10 text-[#109eb1]" />
        </div>

        <div class="space-y-2">
          <h1
            class="text-4xl font-bold font-hebden text-[#c7f4fa] tracking-wide"
          >
            Global Mods
          </h1>
          <div
            class="flex items-center gap-4 text-[#c7f4fa]/70 font-nunito text-sm"
          >
            <div class="flex items-center gap-1.5">
              <Package class="size-4" />
              <span>{globalMods.length} Mods</span>
            </div>
            <span class="size-1 rounded-full bg-[#084b54]"></span>
            <div class="flex items-center gap-1.5">
              <FolderOpen class="size-4" />
              <span class="font-mono text-xs opacity-70 truncate max-w-[300px]"
                >{globalModsPath || 'UserData/Mods'}</span
              >
            </div>
          </div>
          <p class="text-xs text-[#c7f4fa]/50 font-nunito max-w-lg">
            Global mods are shared across all saves. When you install a mod,
            it's copied here automatically.
          </p>
        </div>
      </div>

      <div class="flex gap-3">
        <Button
          size="icon"
          variant="outline"
          class="border-[#084b54] hover:bg-[#109eb1]/10 text-[#c7f4fa] bg-[#032125]"
          onclick={openGlobalModsFolder}
          title="Open Global Mods Folder"
        >
          <FolderOpen class="size-5" />
        </Button>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-hidden flex flex-col p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold font-hebden text-[#c7f4fa]">
        Installed Mods
      </h2>
      <Button
        variant="outline"
        size="sm"
        class="h-8 text-xs font-nunito border-[#084b54] bg-[#032125] text-[#c7f4fa] hover:bg-[#109eb1]/10 hover:text-[#c7f4fa] gap-2"
        onclick={loadGlobalMods}
      >
        <RefreshCw class="size-3.5" />
        Refresh
      </Button>
    </div>

    <div
      class="flex-1 overflow-y-auto custom-scrollbar border border-[#084b54] rounded-xl bg-[#06363d]/30 backdrop-blur-sm"
    >
      {#if loading}
        <div class="flex items-center justify-center h-32 text-[#c7f4fa]/50">
          Loading...
        </div>
      {:else if globalMods.length === 0}
        <div
          class="flex flex-col items-center justify-center h-32 text-[#c7f4fa]/50 gap-2"
        >
          <Package class="size-8 opacity-50" />
          <span>No global mods installed</span>
        </div>
      {:else}
        <table class="w-full text-left font-nunito">
          <thead
            class="bg-[#032125] text-xs uppercase text-[#c7f4fa]/60 font-bold border-b border-[#084b54]"
          >
            <tr>
              <th class="px-6 py-4 rounded-tl-xl">Name</th>
              <th class="px-6 py-4">Version</th>
              <th class="px-6 py-4 rounded-tr-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#084b54]">
            {#each globalMods as mod}
              <tr class="group hover:bg-[#109eb1]/5 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    {#if mod.orbis_metadata?.iconUrl}
                      <img
                        src={mod.orbis_metadata.iconUrl}
                        alt={mod.manifest.Name}
                        class="size-10 rounded-lg object-cover border border-[#084b54]"
                      />
                    {:else}
                      <div
                        class="size-10 rounded-lg bg-[#06363d] border border-[#084b54] flex items-center justify-center"
                      >
                        <Package class="size-5 text-[#c7f4fa]/30" />
                      </div>
                    {/if}
                    <div class="flex flex-col">
                      <span class="font-bold text-[#c7f4fa]"
                        >{mod.manifest.Name}</span
                      >
                      <span class="text-xs text-[#c7f4fa]/50"
                        >by {mod.orbis_metadata?.author ||
                          mod.manifest.Authors.map((a) => a.Name).join(
                            ', ',
                          )}</span
                      >
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-[#c7f4fa]/70">
                  {mod.manifest.Version}
                </td>
                <td class="px-6 py-4 text-right">
                  <div
                    class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      class="size-8 hover:bg-[#032125] text-[#c7f4fa]/70 hover:text-red-400"
                      title="Remove mod"
                      onclick={() => openDeleteDialog(mod)}
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

<!-- Delete Confirmation Dialog -->
<DeleteModDialog
  bind:open={deleteDialogOpen}
  mod={modToDelete
    ? {
        manifest: modToDelete.manifest,
        jar_name: modToDelete.jar_name,
        enabled: true,
      }
    : null}
  onConfirm={handleDeleteMod}
/>
