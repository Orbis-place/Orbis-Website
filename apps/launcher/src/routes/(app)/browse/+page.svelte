<script lang="ts">
  import Icon from "@iconify/svelte";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
</script>

<div class="flex h-full flex-col items-center justify-center gap-8 p-8">
  <Card.Root class="max-w-2xl w-full bg-card/50 backdrop-blur-sm border-border/50">
    <Card.Header class="text-center space-y-4 pb-8">
      <div class="flex justify-center">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20"
        >
          <Icon icon="lucide:grid-3x3" width={42} class="text-primary" />
        </div>
      </div>
      <Card.Title class="text-3xl font-bold">Browser de contenu Orbis</Card.Title>
      <Card.Description class="text-base">
        Découvrez et explorez tout le contenu disponible sur Orbis : mods, maps,
        ressource packs et plus encore.
      </Card.Description>
    </Card.Header>
    <Card.Content class="flex justify-center gap-3 pb-6">
      <Button variant="default" size="lg" class="rounded-xl">
        <Icon icon="lucide:search" width={18} class="mr-2" />
        Parcourir le contenu
      </Button>
      <Button variant="outline" size="lg" class="rounded-xl">
        <Icon icon="lucide:filter" width={18} class="mr-2" />
        Filtres
      </Button>
    </Card.Content>
  </Card.Root>
</div>
