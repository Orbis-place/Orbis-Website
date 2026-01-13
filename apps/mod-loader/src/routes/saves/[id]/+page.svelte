<script lang="ts">
  import { page } from '$app/stores';
  import { saves, selectedSave, selectSave } from '$lib/stores/saves';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import {
    Play,
    FolderOpen,
    Settings,
    MoreVertical,
    Package,
    HardDrive,
    Trash2,
    RefreshCw,
  } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { modManager } from '$lib/services/mod-manager';
  import type { InstalledMod } from '$lib/types/installed-mod';
  import { invoke } from '@tauri-apps/api/core';
  import { open } from '@tauri-apps/plugin-opener';

  const saveName = $derived($page.params.id);
  const currentSave = $derived($saves.find((s) => s.name === saveName));

  let installedMods = $state<InstalledMod[]>([]);
  let loading = $state(true);

  onMount(async () => {
    if (!currentSave) {
      // Handle 404
      goto('/');
    } else {
      selectSave(currentSave);
      await loadInstalledMods();
    }
  });

  async function loadInstalledMods() {
    if (!currentSave) return;

    loading = true;
    try {
      installedMods = await modManager.getInstalledMods(currentSave.path);
    } catch (error) {
      console.error('Failed to load installed mods:', error);
    } finally {
      loading = false;
    }
  }

  async function toggleMod(mod: InstalledMod) {
    if (!currentSave) return;

    try {
      await invoke('toggle_mod', {
        savePath: currentSave.path,
        group: mod.manifest.Group,
        name: mod.manifest.Name,
        enabled: !mod.enabled,
      });

      // Reload the mods list
      await loadInstalledMods();
    } catch (error) {
      console.error('Failed to toggle mod:', error);
      alert(`Failed to toggle mod: ${error}`);
    }
  }

  async function openSaveFolder() {
    if (!currentSave) return;
    try {
      await open(currentSave.path);
    } catch (error) {
      console.error('Failed to open save folder:', error);
    }
  }

  async function openModFolder() {
    if (!currentSave) return;
    try {
      await open(currentSave.path + '/mods');
    } catch (error) {
      console.error('Failed to open mod folder:', error);
    }
  }
</script>

{#if currentSave}
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
          <!-- Save Icon/Preview -->
          <div
            class="size-24 rounded-2xl bg-gradient-to-br from-[#06363d] to-[#032125] border border-[#084b54] flex items-center justify-center shadow-2xl"
          >
            <HardDrive class="size-10 text-[#109eb1]" />
          </div>

          <div class="space-y-2">
            <h1
              class="text-4xl font-bold font-hebden text-[#c7f4fa] tracking-wide"
            >
              {currentSave.name}
            </h1>
            <div
              class="flex items-center gap-4 text-[#c7f4fa]/70 font-nunito text-sm"
            >
              <div class="flex items-center gap-1.5">
                <Package class="size-4" />
                <span>{currentSave.installedModsCount} Mods</span>
              </div>
              <span class="size-1 rounded-full bg-[#084b54]"></span>
              <div class="flex items-center gap-1.5">
                <FolderOpen class="size-4" />
                <span
                  class="font-mono text-xs opacity-70 truncate max-w-[300px]"
                  >{currentSave.path}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <Button
            size="icon"
            variant="outline"
            class="border-[#084b54] hover:bg-[#109eb1]/10 text-[#c7f4fa] bg-[#032125]"
          >
            <Settings class="size-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            class="border-[#084b54] hover:bg-[#109eb1]/10 text-[#c7f4fa] bg-[#032125]"
            onclick={openSaveFolder}
            title="Open Save Folder"
          >
            <FolderOpen class="size-5" />
          </Button>
          <Button
            class="bg-[#109eb1] hover:bg-[#109eb1]/90 text-white font-hebden tracking-wider gap-2 px-6 shadow-[0_0_20px_rgba(16,158,177,0.2)]"
          >
            <Play class="size-5 fill-current" />
            Launch
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
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            class="h-8 text-xs font-nunito border-[#084b54] bg-[#032125] text-[#c7f4fa] hover:bg-[#109eb1]/10 hover:text-[#c7f4fa]"
            onclick={openModFolder}
          >
            Open Mod Folder
          </Button>
          <Button
            size="sm"
            class="h-8 text-xs font-nunito bg-[#109eb1] hover:bg-[#109eb1]/90 text-white border-0 gap-2"
            onclick={() => {
              if (currentSave) {
                selectSave(currentSave);
                goto('/');
              }
            }}
          >
            <Package class="size-3.5" />
            Add Mods
          </Button>
        </div>
      </div>

      <div
        class="flex-1 overflow-y-auto custom-scrollbar border border-[#084b54] rounded-xl bg-[#06363d]/30 backdrop-blur-sm"
      >
        <table class="w-full text-left font-nunito">
          <thead
            class="bg-[#032125] text-xs uppercase text-[#c7f4fa]/60 font-bold border-b border-[#084b54]"
          >
            <tr>
              <th class="px-6 py-4 rounded-tl-xl">Name</th>
              <th class="px-6 py-4">Version</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 rounded-tr-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#084b54]">
            {#each installedMods as mod}
              <tr class="group hover:bg-[#109eb1]/5 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-[#c7f4fa]"
                      >{mod.manifest.Name}</span
                    >
                    <span class="text-xs text-[#c7f4fa]/50"
                      >by {mod.manifest.Authors.map((a) => a.Name).join(
                        ', ',
                      )}</span
                    >
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-[#c7f4fa]/70">
                  {mod.manifest.Version}
                </td>
                <td class="px-6 py-4">
                  <Badge
                    variant={mod.enabled ? 'default' : 'secondary'}
                    class={mod.enabled
                      ? 'bg-[#109eb1]/20 text-[#109eb1] hover:bg-[#109eb1]/30 cursor-pointer'
                      : 'bg-[#032125] text-[#c7f4fa]/50 cursor-pointer'}
                    onclick={() => toggleMod(mod)}
                  >
                    {mod.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </td>
                <td class="px-6 py-4 text-right">
                  <div
                    class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      class="size-8 hover:bg-[#032125] text-[#c7f4fa]/70 hover:text-[#109eb1]"
                      onclick={() => toggleMod(mod)}
                      title={mod.enabled ? 'Disable mod' : 'Enable mod'}
                    >
                      <RefreshCw class="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      class="size-8 hover:bg-[#032125] text-[#c7f4fa]/70 hover:text-red-400"
                      title="Remove mod"
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center h-full text-muted-foreground">
    Save not found
  </div>
{/if}
