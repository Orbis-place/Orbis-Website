<script lang="ts">
  import Icon from "@iconify/svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";

  // Mock server data - à remplacer par de vraies données plus tard
  const servers = [
    {
      id: 1,
      name: "Serveur Principal",
      icon: "lucide:gamepad-2",
      status: "online",
      players: 12,
      maxPlayers: 20,
    },
    {
      id: 2,
      name: "Serveur Créatif",
      icon: "lucide:palette",
      status: "online",
      players: 5,
      maxPlayers: 10,
    },
    {
      id: 3,
      name: "Serveur Modé",
      icon: "lucide:zap",
      status: "offline",
      players: 0,
      maxPlayers: 15,
    },
  ];

  function getStatusColor(status: string) {
    return status === "online" ? "bg-green-400" : "bg-gray-500";
  }
</script>

<Tooltip.Provider>
  <div class="flex-1 overflow-y-auto p-3 space-y-3">
    {#each servers as server}
      <Tooltip.Root>
        <Tooltip.Trigger class="relative w-full flex items-center justify-center p-1 rounded-xl transition-colors hover:bg-secondary/60">
          <div class="relative">
            <div class="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center transition-colors">
              <Icon icon={server.icon} width={24} class="text-foreground" />
            </div>
            <!-- Indicateur de status -->
            <div
              class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full {getStatusColor(server.status)} border-2 border-background"
            ></div>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">
          <div class="text-sm font-medium">{server.name}</div>
          {#if server.status === "online"}
            <div class="text-xs text-muted-foreground">
              {server.players}/{server.maxPlayers} joueurs
            </div>
          {:else}
            <div class="text-xs text-muted-foreground">Hors ligne</div>
          {/if}
        </Tooltip.Content>
      </Tooltip.Root>
    {/each}
  </div>
</Tooltip.Provider>
