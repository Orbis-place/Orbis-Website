<script lang="ts">
  import Logo from "./Logo.svelte";
  import NavigationButtons from "./NavigationButtons.svelte";
  import MainNavigation from "./MainNavigation.svelte";
  import WindowControls from "./WindowControls.svelte";
</script>

<div
  class="flex h-(--top-bar-height) w-full items-center justify-between bg-secondary/30 backdrop-blur-sm border-b border-border/50 select-none"
  data-tauri-drag-region
>
  <!-- Left section - Logo + Navigation -->
  <div class="flex items-center h-full w-full px-4 gap-4" data-tauri-drag-region>
    <Logo />
    <NavigationButtons />
    <MainNavigation />
  </div>

  <!-- Right section - Window controls -->
  <WindowControls />
</div>
