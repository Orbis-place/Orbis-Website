<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { servers, runningCount } from '$lib/stores/servers';
  import { unreadCount, notifications } from '$lib/stores/notifications';
  import { toasts } from '$lib/stores/notifications';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { goto } from '$app/navigation';

  // Get first 3 servers for quick access in sidebar
  $: sidebarServers = $servers.slice(0, 3);

  // Navigation items
  const navItems = [
    { id: 'home', href: '/', icon: 'home', label: 'Home' },
    { id: 'servers', href: '/servers', label: 'Servers', icon: 'server' },
    { id: 'browse', href: '/browse', label: 'Browse', icon: 'compass' },
    { id: 'files', href: '/files', label: 'Files', icon: 'folder' },
  ];

  // Check if route is active
  function isActive(href: string): boolean {
    if (href === '/') return $page.url.pathname === '/';
    return $page.url.pathname.startsWith(href);
  }

  // Notifications dropdown
  let showNotifications = false;

  function markAllRead() {
    notifications.markAllRead();
  }

  // Window controls
  async function minimizeWindow() {
    await getCurrentWindow().minimize();
  }

  async function toggleMaximize() {
    await getCurrentWindow().toggleMaximize();
  }

  async function closeWindow() {
    await getCurrentWindow().close();
  }

  function goBack() {
    history.back();
  }

  function goForward() {
    history.forward();
  }
</script>

<div class="app-grid-layout rounded-lg overflow-hidden shadow-2xl">
  <!-- Left Sidebar Navigation -->
  <div class="app-grid-navbar flex flex-col p-2 gap-2">
    <!-- Logo -->
    <a href="/" class="nav-button {isActive('/') ? 'active' : ''}" title="Home">
      <img src="/icon.png" alt="Orbis" class="w-8 h-8" />
    </a>

    <!-- Main Navigation -->
    {#each navItems.slice(1) as item}
      <a
        href={item.href}
        class="nav-button {isActive(item.href) ? 'active' : ''}"
        title={item.label}
      >
        {#if item.icon === 'server'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <rect x="2" y="3" width="20" height="6" rx="1" />
            <rect x="2" y="15" width="20" height="6" rx="1" />
            <circle cx="6" cy="6" r="1" fill="currentColor" />
            <circle cx="6" cy="18" r="1" fill="currentColor" />
          </svg>
        {:else if item.icon === 'compass'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
            />
          </svg>
        {:else if item.icon === 'folder'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"
            />
          </svg>
        {/if}
      </a>
    {/each}

    <!-- Divider -->
    <div class="h-px w-6 mx-auto my-2 bg-border"></div>

    <!-- Server Instances Quick Access -->
    {#each sidebarServers as server (server.id)}
      <a
        href="/servers/{server.id}"
        class="nav-button relative"
        title={server.name}
      >
        <span class="text-lg">🖥️</span>
        {#if server.status === 'running'}
          <span
            class="absolute bottom-0 right-0 w-3 h-3 bg-status-approved rounded-full border-2 border-secondary"
          ></span>
        {:else if server.status === 'starting' || server.status === 'stopping'}
          <span
            class="absolute bottom-0 right-0 w-3 h-3 bg-status-pending rounded-full border-2 border-secondary animate-pulse"
          ></span>
        {/if}
      </a>
    {/each}

    <!-- Add Server Button -->
    <button class="nav-button" title="Add Server">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Settings -->
    <a href="/settings" class="nav-button" title="Settings">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        />
      </svg>
    </a>
  </div>

  <!-- Top Bar -->
  <header
    class="app-grid-statusbar flex items-center px-4 gap-4"
    data-tauri-drag-region
  >
    <!-- Logo & Nav Controls -->
    <div data-tauri-drag-region class="flex items-center gap-3">
      <img src="/logo.png" alt="Orbis" class="h-6 w-auto" />

      <div class="flex items-center gap-1 ml-3">
        <button
          onclick={goBack}
          class="titlebar-button"
          title="Back"
          data-tauri-drag-region-exclude
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m12 19-7-7 7-7M19 12H5"
            />
          </svg>
        </button>
        <button
          onclick={goForward}
          class="titlebar-button"
          title="Forward"
          data-tauri-drag-region-exclude
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Breadcrumb -->
      <div data-tauri-drag-region class="flex items-center gap-1 pl-3">
        <span class="text-foreground font-semibold cursor-default select-none">
          {#if $page.url.pathname === '/'}
            Home
          {:else if $page.url.pathname.startsWith('/servers')}
            Servers
          {:else if $page.url.pathname.startsWith('/browse')}
            Browse
          {:else if $page.url.pathname.startsWith('/files')}
            Files
          {:else if $page.url.pathname.startsWith('/settings')}
            Settings
          {:else}
            Orbis
          {/if}
        </span>
      </div>
    </div>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Status Indicator -->
    <div
      class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm text-muted-foreground"
    >
      <span
        class="w-2 h-2 rounded-full"
        class:bg-status-approved={$runningCount > 0}
        class:shadow-[0_0_8px_var(--color-status-approved)]={$runningCount > 0}
        class:animate-pulse={$runningCount > 0}
        class:bg-muted-foreground={$runningCount === 0}
      ></span>
      <span class="hidden sm:inline">
        {#if $runningCount > 0}
          {$runningCount} running
        {:else}
          No instances running
        {/if}
      </span>
    </div>

    <!-- Notifications -->
    <div class="relative">
      <button
        class="titlebar-button relative"
        title="Notifications"
        onclick={() => (showNotifications = !showNotifications)}
        data-tauri-drag-region-exclude
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {#if $unreadCount > 0}
          <span
            class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
          >
            {$unreadCount}
          </span>
        {/if}
      </button>

      {#if showNotifications}
        <div
          class="absolute right-0 top-full mt-2 w-80 bg-card backdrop-blur-xl border border-border rounded-xl overflow-hidden transition-all duration-200 p-0 z-50 max-h-96 flex flex-col shadow-xl"
        >
          <div
            class="p-3 border-b border-border flex items-center justify-between"
          >
            <span class="font-bold">Notifications</span>
            {#if $unreadCount > 0}
              <button
                class="text-xs text-primary hover:underline"
                onclick={markAllRead}>Mark all read</button
              >
            {/if}
          </div>
          <div class="overflow-y-auto flex-1">
            {#each $notifications as notif (notif.id)}
              <div
                class="p-3 border-b border-border hover:bg-secondary/50 {notif.read
                  ? 'opacity-60'
                  : ''}"
              >
                <div class="flex items-start gap-2">
                  <span
                    class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 {notif.type ===
                    'error'
                      ? 'bg-destructive'
                      : notif.type === 'warning'
                        ? 'bg-status-pending'
                        : notif.type === 'success'
                          ? 'bg-status-approved'
                          : 'bg-primary'}"
                  ></span>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm">{notif.title}</p>
                    <p class="text-xs text-muted-foreground">{notif.message}</p>
                  </div>
                </div>
              </div>
            {:else}
              <div class="p-6 text-center text-muted-foreground text-sm">
                No notifications
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Window Controls -->
    <div class="flex items-center ml-2">
      <button
        class="titlebar-button"
        onclick={minimizeWindow}
        title="Minimize"
        data-tauri-drag-region-exclude
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" d="M5 12h14" />
        </svg>
      </button>
      <button
        class="titlebar-button"
        onclick={toggleMaximize}
        title="Maximize"
        data-tauri-drag-region-exclude
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      </button>
      <button
        class="titlebar-button close"
        onclick={closeWindow}
        title="Close"
        data-tauri-drag-region-exclude
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.7a1 1 0 0 0-1.42 1.42L10.59 12l-4.88 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.42L13.41 12l4.88-4.88a1 1 0 0 0 0-1.41z"
          />
        </svg>
      </button>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="app-grid-content">
    <slot />
  </main>
</div>

<!-- Toast Notifications -->
<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  {#each $toasts as toast (toast.id)}
    <div
      class="bg-card backdrop-blur-xl border overflow-hidden transition-all duration-200 px-4 py-3 flex items-center gap-3 min-w-[280px] animate-slide-in rounded-xl shadow-lg
              {toast.type === 'error'
        ? 'border-destructive'
        : toast.type === 'warning'
          ? 'border-status-pending'
          : toast.type === 'success'
            ? 'border-status-approved'
            : 'border-primary'}"
    >
      <span
        class="w-2 h-2 rounded-full flex-shrink-0 {toast.type === 'error'
          ? 'bg-destructive'
          : toast.type === 'warning'
            ? 'bg-status-pending'
            : toast.type === 'success'
              ? 'bg-status-approved'
              : 'bg-primary'}"
      ></span>
      <span class="text-sm flex-1">{toast.message}</span>
      <button
        class="text-muted-foreground hover:text-foreground"
        onclick={() => toasts.dismiss(toast.id)}
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<!-- Click outside to close notifications -->
{#if showNotifications}
  <div
    class="fixed inset-0 z-40"
    onclick={() => (showNotifications = false)}
  ></div>
{/if}

<style>
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.2s ease-out;
  }
</style>
