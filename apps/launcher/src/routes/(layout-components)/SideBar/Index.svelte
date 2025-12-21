<script lang="ts">
  import Header from "./Header.svelte";
  import ServerList from "./ServerList.svelte";
  import Footer from "./Footer.svelte";
</script>

<aside
  class="flex h-full w-20 flex-col bg-secondary/30 backdrop-blur-sm border-r border-border/50"
>
  <Header />
  <ServerList />
  <Footer />
</aside>
