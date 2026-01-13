<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { FolderOpen, Package, Download, Play, Zap } from 'lucide-svelte';
  import { saves, selectedSave, selectSave } from '$lib/stores/saves';
  import { goto } from '$app/navigation';

  // Compute stats
  $: totalMods = $saves.reduce((acc, save) => acc + save.installedModsCount, 0);
  $: lastPlayedSave = [...$saves].sort(
    (a, b) =>
      new Date(b.lastPlayed || 0).getTime() -
      new Date(a.lastPlayed || 0).getTime(),
  )[0];

  function launchLastPlayed() {
    if (lastPlayedSave) {
      selectSave(lastPlayedSave);
      goto(`/saves/${encodeURIComponent(lastPlayedSave.name)}`);
    }
  }
</script>

<div class="flex flex-1 flex-col overflow-hidden bg-[#032125]">
  <!-- Header NOT needed here if it's in layout, but previous code used a Header component. 
       Let's assume the layout handles sidebar and we just render main content here. 
       Wait, previous +page.svelte had <Header />. Let's start clean. -->

  <main class="flex-1 overflow-y-auto p-8 custom-scrollbar">
    <div class="mx-auto max-w-7xl space-y-10">
      <!-- Welcome Section -->
      <div
        class="relative overflow-hidden rounded-[25px] bg-gradient-to-r from-[#109eb1]/20 via-[#06363d] to-[#032125] p-8 border border-[#109eb1]/30"
      >
        <div
          class="absolute top-0 right-0 p-32 bg-[#109eb1]/10 blur-[100px] rounded-full pointer-events-none"
        ></div>
        <div class="relative z-10">
          <h1 class="text-4xl font-bold font-hebden text-[#c7f4fa] mb-2">
            Welcome back, Traveler
          </h1>
          <p class="text-[#c7f4fa]/70 font-nunito text-lg max-w-2xl">
            Ready to explore new horizons? Manage your saves and customize your
            adventure with the latest mods from the marketplace.
          </p>
          <div class="mt-6 flex gap-4">
            {#if lastPlayedSave}
              <Button
                class="bg-[#109eb1] hover:bg-[#109eb1]/90 text-[#c7f4fa] font-hebden rounded-full px-6 h-10 tracking-wider"
                onclick={launchLastPlayed}
              >
                <Play class="size-4 mr-2" />
                Resume: {lastPlayedSave.name}
              </Button>
            {/if}
            <Button
              variant="outline"
              class="border-[#109eb1]/30 text-[#c7f4fa] hover:bg-[#109eb1]/10 font-hebden rounded-full px-6 h-10 tracking-wider"
              href="/browse"
            >
              <Package class="size-4 mr-2" />
              Browse Mods
            </Button>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid gap-6 md:grid-cols-3">
        <!-- Total Saves -->
        <div
          class="bg-[#06363d]/50 border border-[#084b54] p-6 rounded-[20px] hover:border-[#109eb1]/50 transition-colors backdrop-blur-sm"
        >
          <div class="flex items-center gap-4 mb-2">
            <div class="bg-[#109eb1]/10 p-2.5 rounded-xl">
              <FolderOpen class="size-6 text-[#109eb1]" />
            </div>
            <div>
              <p
                class="text-[#c7f4fa]/50 font-hebden text-xs uppercase tracking-wider"
              >
                Total Saves
              </p>
              <p class="text-2xl font-bold font-hebden text-[#c7f4fa]">
                {$saves.length}
              </p>
            </div>
          </div>
        </div>

        <!-- Total Mods -->
        <div
          class="bg-[#06363d]/50 border border-[#084b54] p-6 rounded-[20px] hover:border-[#109eb1]/50 transition-colors backdrop-blur-sm"
        >
          <div class="flex items-center gap-4 mb-2">
            <div class="bg-[#109eb1]/10 p-2.5 rounded-xl">
              <Package class="size-6 text-[#109eb1]" />
            </div>
            <div>
              <p
                class="text-[#c7f4fa]/50 font-hebden text-xs uppercase tracking-wider"
              >
                Installed Mods
              </p>
              <p class="text-2xl font-bold font-hebden text-[#c7f4fa]">
                {totalMods}
              </p>
            </div>
          </div>
        </div>

        <!-- Updates (Mock) -->
        <div
          class="bg-[#06363d]/50 border border-[#084b54] p-6 rounded-[20px] hover:border-[#109eb1]/50 transition-colors backdrop-blur-sm"
        >
          <div class="flex items-center gap-4 mb-2">
            <div class="bg-[#109eb1]/10 p-2.5 rounded-xl">
              <Zap class="size-6 text-[#109eb1]" />
            </div>
            <div>
              <p
                class="text-[#c7f4fa]/50 font-hebden text-xs uppercase tracking-wider"
              >
                Updates Available
              </p>
              <p class="text-2xl font-bold font-hebden text-[#c7f4fa]">2</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity / Quick Access -->
      <div>
        <h2 class="text-2xl font-bold font-hebden text-[#c7f4fa] mb-6">
          Your Saves
        </h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each $saves as save}
            <a
              href={`/saves/${encodeURIComponent(save.name)}`}
              onclick={() => selectSave(save)}
              class="group relative overflow-hidden rounded-[25px] border border-[#084b54] bg-[#06363d] transition-all duration-300 hover:border-[#109eb1] hover:shadow-[0_0_20px_rgba(16,158,177,0.15)] flex flex-col"
            >
              <!-- Save Preview (Gradient/Image) -->
              <div
                class="h-32 w-full bg-gradient-to-br from-[#06363d] via-[#084b54] to-[#109eb1]/20 relative overflow-hidden"
              >
                <div
                  class="absolute inset-0 bg-[#032125]/20 group-hover:bg-transparent transition-colors"
                ></div>
              </div>
              <div class="p-5">
                <h3
                  class="font-hebden font-semibold text-lg text-[#c7f4fa] group-hover:text-[#109eb1] transition-colors mb-1"
                >
                  {save.name}
                </h3>
                <div
                  class="flex items-center gap-2 text-[#c7f4fa]/60 text-xs font-nunito mb-4"
                >
                  <span
                    >Last played: {new Date(
                      save.lastPlayed || 0,
                    ).toLocaleDateString()}</span
                  >
                </div>
                <div
                  class="flex items-center justify-between pt-3 border-t border-[#084b54]"
                >
                  <span class="text-xs font-hebden text-[#109eb1]"
                    >{save.installedModsCount} MODS</span
                  >
                  <span
                    class="text-xs font-hebden text-[#c7f4fa]/50 group-hover:text-[#c7f4fa] transition-colors"
                    >MANAGE -></span
                  >
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </main>
</div>
