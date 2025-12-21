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
          <Icon icon="lucide:activity" width={42} class="text-primary" />
        </div>
      </div>
      <Card.Title class="text-3xl font-bold">Monitoring</Card.Title>
      <Card.Description class="text-base">
        Surveillez les performances de vos serveurs et instances en temps réel.
      </Card.Description>
    </Card.Header>
    <Card.Content class="flex justify-center gap-3 pb-6">
      <Button variant="default" size="lg" class="rounded-xl">
        <Icon icon="lucide:bar-chart" width={18} class="mr-2" />
        Voir les stats
      </Button>
      <Button variant="outline" size="lg" class="rounded-xl">
        <Icon icon="lucide:settings" width={18} class="mr-2" />
        Configuration
      </Button>
    </Card.Content>
  </Card.Root>
</div>
