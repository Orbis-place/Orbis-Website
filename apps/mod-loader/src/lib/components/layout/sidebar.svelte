<script lang="ts">
  import { cn } from '$lib/utils';
  import { page } from '$app/stores';
  import { saves, selectedSave, selectSave } from '$lib/stores/saves';
  import {
    LayoutDashboard,
    Compass,
    Settings,
    ChevronRight,
    FolderOpen,
    Plus,
    ChevronDown,
  } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import ImportSaveDialog from '$lib/components/import-save-dialog.svelte';

  type NavItem = {
    label: string;
    icon: any;
    href: string;
  };

  let isSavesOpen = true;
  let isImportDialogOpen = $state(false);

  function isActive(href: string): boolean {
    if (href === '/') {
      return $page.url.pathname === '/';
    }
    return $page.url.pathname.startsWith(href);
  }

  function toggleSaves() {
    isSavesOpen = !isSavesOpen;
  }

  function openImportDialog() {
    isImportDialogOpen = true;
  }
</script>

<aside
  class="flex w-64 flex-col gap-6 p-4 bg-[#032125] border-r border-[#084b54] overflow-y-auto custom-scrollbar"
>
  <!-- Logo -->
  <div class="px-2 pt-6 pb-2" data-tauri-drag-region>
    <img
      src="/navbar_header.png"
      alt="Orbis Logo"
      class="h-8 object-contain pointer-events-none"
    />
  </div>

  <!-- Navigation -->
  <nav class="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
    <!-- Library Section -->
    <div class="space-y-2">
      <h3
        class="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 font-hebden"
      >
        Library
      </h3>
      <div class="space-y-1">
        <a
          href="/"
          class={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all font-nunito',
            isActive('/')
              ? 'bg-[#06363d] text-[#c7f4fa] border border-[#084b54]'
              : 'text-[#c7f4fa]/70 hover:bg-[#06363d]/50 hover:text-[#c7f4fa] border border-transparent',
          )}
        >
          <Compass
            class={cn(
              'size-5 shrink-0 transition-transform group-hover:scale-110',
              isActive('/')
                ? 'text-[#109eb1]'
                : 'text-[#c7f4fa]/70 group-hover:text-[#c7f4fa]',
            )}
          />
          <span class="flex-1 text-left">Browse Mods</span>
          {#if isActive('/')}
            <ChevronRight class="size-4 opacity-50" />
          {/if}
        </a>
      </div>
    </div>

    <!-- Saves Section (Accordion) -->
    <div class="space-y-2">
      <div
        class="flex items-center justify-between px-3 cursor-pointer group"
        onclick={toggleSaves}
      >
        <h3
          class="text-xs font-bold uppercase tracking-wider text-[#c7f4fa]/60 font-hebden group-hover:text-[#c7f4fa] transition-colors"
        >
          My Saves
        </h3>
        <button
          class="text-[#c7f4fa]/60 hover:text-[#c7f4fa] transition-colors"
        >
          <ChevronDown
            class={cn(
              'size-3 transition-transform duration-200',
              !isSavesOpen && '-rotate-90',
            )}
          />
        </button>
      </div>

      {#if isSavesOpen}
        <div transition:slide={{ duration: 200 }} class="space-y-1">
          {#each $saves as save}
            {@const saveUrl = `/saves/${encodeURIComponent(save.name)}`}
            {@const isSelected = $page.url.pathname.startsWith(saveUrl)}
            <!-- Using name as ID for demo -->
            <a
              href={saveUrl}
              class={cn(
                'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all font-nunito',
                isSelected
                  ? 'bg-[#109eb1]/10 text-[#109eb1] border border-[#109eb1]/20'
                  : 'text-[#c7f4fa]/70 hover:bg-[#06363d] hover:text-[#c7f4fa] border border-transparent',
              )}
              onclick={() => selectSave(save)}
            >
              <div
                class={cn(
                  'size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  isSelected
                    ? 'bg-[#109eb1]/20'
                    : 'bg-[#06363d] group-hover:bg-[#109eb1]/10',
                )}
              >
                <FolderOpen
                  class={cn(
                    'size-4',
                    isSelected ? 'text-[#109eb1]' : 'text-[#c7f4fa]/70',
                  )}
                />
              </div>

              <div class="flex-1 min-w-0 flex flex-col items-start gap-0.5">
                <span class="truncate w-full text-left">{save.name}</span>
                <span class="text-[10px] text-[#c7f4fa]/50 font-normal"
                  >{save.installedModsCount} mods</span
                >
              </div>

              {#if isSelected}
                <div
                  class="size-1.5 rounded-full bg-[#109eb1] animate-pulse"
                ></div>
              {/if}
            </a>
          {/each}

          <!-- Add Save Button -->
          <button
            onclick={openImportDialog}
            class="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#c7f4fa]/60 hover:text-[#109eb1] transition-colors group mt-2"
          >
            <div
              class="size-8 rounded-lg border border-dashed border-[#084b54] flex items-center justify-center group-hover:border-[#109eb1]/30 transition-colors"
            >
              <Plus class="size-4" />
            </div>
            <span>Import Save</span>
          </button>
        </div>
      {/if}
    </div>

    <!-- Settings Section -->
    <div class="space-y-2">
      <h3
        class="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 font-hebden"
      >
        System
      </h3>
      <div class="space-y-1">
        <a
          href="/settings"
          class={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all font-nunito',
            isActive('/settings')
              ? 'bg-[#109eb1]/10 text-[#109eb1] shadow-[0_0_20px_rgba(16,158,177,0.15)] border border-[#109eb1]/20'
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent',
          )}
        >
          <Settings
            class={cn(
              'size-5 shrink-0 transition-transform group-hover:scale-110',
              isActive('/settings')
                ? 'text-[#109eb1]'
                : 'text-muted-foreground group-hover:text-foreground',
            )}
          />
          <span class="flex-1 text-left">Settings</span>
        </a>
      </div>
    </div>
  </nav>
</aside>

<ImportSaveDialog bind:isOpen={isImportDialogOpen} />
