<script lang="ts">
  import type { Snippet } from "svelte";
  import "../app.css";
  import Header from "./(layout-components)/Header/Index.svelte";
  import SideBar from "./(layout-components)/SideBar/Index.svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";

  const {
    children,
  }: {
    children: Snippet;
  } = $props();

  let isMaximized = $state(false);
  const appWindow = getCurrentWindow();

  onMount(async () => {
    isMaximized = await appWindow.isMaximized();
    appWindow.onResized(async () => {
      isMaximized = await appWindow.isMaximized();
    });
  });
</script>

<div class="flex size-full flex-col bg-background {isMaximized ? 'rounded-none' : 'rounded-2xl'} overflow-hidden">
  <Header />
  <div class="flex flex-1 overflow-hidden">
    <SideBar />
    <main class="flex-1 overflow-auto">
      {@render children()}
    </main>
  </div>
</div>

