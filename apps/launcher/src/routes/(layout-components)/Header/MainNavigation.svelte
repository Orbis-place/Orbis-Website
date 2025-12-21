<script lang="ts">
  import { page } from "$app/stores";
  import Icon from "@iconify/svelte";

  const navItems = [
    { href: "/browse", label: "Browser", icon: "lucide:grid-3x3" },
    { href: "/servers", label: "Serveurs", icon: "lucide:server" },
    // { href: "/monitoring", label: "Monitoring", icon: "lucide:activity" },
  ];
</script>

<nav class="flex items-center gap-2 h-full flex-1 justify-center" data-tauri-drag-region>
  {#each navItems as item}
    <a
      href={item.href}
      class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all {$page.url.pathname === item.href
        ? 'text-foreground bg-primary/15 shadow-sm'
        : 'text-foreground/60 hover:text-foreground hover:bg-secondary/60'}"
    >
      <Icon icon={item.icon} width={18} />
      <span>{item.label}</span>
    </a>
  {/each}
</nav>
