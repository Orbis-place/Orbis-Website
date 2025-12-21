<script lang="ts">
  import { files, backups } from '$lib/stores/files';
  import { servers } from '$lib/stores/servers';
  import { toasts } from '$lib/stores/notifications';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Badge } from '$lib/components/ui/badge';
  import type { FileNode } from '$lib/stores/mockData';

  let selectedServerId = $servers[0]?.id || '';
  let currentPath = '/';
  let selectedFile: FileNode | null = null;
  let fileContent = '';
  let isEditing = false;
  let expandedDirs = new Set<string>(['/']);

  $: serverFiles = selectedServerId
    ? files.getServerFiles(selectedServerId)
    : null;
  $: serverBackups = selectedServerId
    ? backups.getForServer(selectedServerId)
    : [];

  function selectFile(node: FileNode) {
    if (node.type === 'directory') {
      toggleDir(node.path);
    } else {
      selectedFile = node;
      const content = files.getFileContent(selectedServerId, node.path);
      fileContent = content || '';
      isEditing = false;
    }
  }

  function toggleDir(path: string) {
    if (expandedDirs.has(path)) {
      expandedDirs.delete(path);
    } else {
      expandedDirs.add(path);
    }
    expandedDirs = expandedDirs;
  }

  function saveFile() {
    if (!selectedFile) return;
    files.saveFileContent(selectedServerId, selectedFile.path, fileContent);
    toasts.show('success', 'File saved');
    isEditing = false;
  }

  function getFileIcon(name: string, type: string): string {
    if (type === 'directory') return '📁';
    if (name.endsWith('.yml') || name.endsWith('.yaml')) return '⚙️';
    if (name.endsWith('.json')) return '📋';
    if (name.endsWith('.jar')) return '📦';
    if (name.endsWith('.log') || name.endsWith('.gz')) return '📄';
    return '📄';
  }

  function formatBytes(bytes: number | undefined): string {
    if (!bytes) return '--';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderTree(node: FileNode, depth = 0): FileNode[] {
    const items: FileNode[] = [node];
    if (
      node.type === 'directory' &&
      expandedDirs.has(node.path) &&
      node.children
    ) {
      for (const child of node.children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })) {
        items.push(...renderTree(child, depth + 1));
      }
    }
    return items;
  }

  $: flatTree = serverFiles ? renderTree(serverFiles) : [];

  function getDepth(path: string): number {
    return path.split('/').filter(Boolean).length;
  }

  function handleServerChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    selectedServerId = target.value;
    selectedFile = null;
    currentPath = '/';
    expandedDirs = new Set(['/']);
  }
</script>

<div class="p-6 h-full flex flex-col gap-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">File Manager</h1>
      <p class="text-muted-foreground">
        Browse and edit server files and configurations
      </p>
    </div>

    <select
      value={selectedServerId}
      onchange={handleServerChange}
      class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm w-[200px]"
    >
      {#each $servers as server}
        <option value={server.id}>{server.name}</option>
      {/each}
    </select>
  </div>

  {#if selectedServerId && serverFiles}
    <div class="flex-1 grid grid-cols-12 gap-4 min-h-0">
      <!-- File Tree -->
      <Card.Root class="col-span-4 flex flex-col min-h-0">
        <Card.Header class="pb-3">
          <Card.Title class="text-base">Files</Card.Title>
        </Card.Header>
        <Card.Content class="flex-1 overflow-hidden p-0">
          <div class="h-full overflow-y-auto">
            <div class="px-4 pb-4 space-y-0.5">
              {#each flatTree as node}
                <button
                  class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-secondary/50 transition-colors text-left {selectedFile?.path ===
                  node.path
                    ? 'bg-primary/20 text-primary'
                    : ''}"
                  style="padding-left: {getDepth(node.path) * 16 + 8}px"
                  onclick={() => selectFile(node)}
                >
                  {#if node.type === 'directory'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4 transition-transform {expandedDirs.has(
                        node.path,
                      )
                        ? 'rotate-90'
                        : ''}"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  {:else}
                    <span class="w-4"></span>
                  {/if}
                  <span>{getFileIcon(node.name, node.type)}</span>
                  <span class="truncate">{node.name}</span>
                  {#if node.type === 'file' && node.size}
                    <span class="text-xs text-muted-foreground ml-auto">
                      {formatBytes(node.size)}
                    </span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- File Editor -->
      <Card.Root class="col-span-8 flex flex-col min-h-0">
        {#if selectedFile}
          <Card.Header class="pb-3">
            <div class="flex items-center justify-between">
              <div>
                <Card.Title class="text-base flex items-center gap-2">
                  {getFileIcon(selectedFile.name, selectedFile.type)}
                  {selectedFile.name}
                </Card.Title>
                <Card.Description>
                  {selectedFile.path} • {formatBytes(selectedFile.size)}
                </Card.Description>
              </div>
              <div class="flex gap-2">
                {#if isEditing}
                  <Button variant="outline" onclick={() => (isEditing = false)}>
                    Cancel
                  </Button>
                  <Button onclick={saveFile}>Save</Button>
                {:else}
                  <Button variant="outline" onclick={() => (isEditing = true)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                      />
                    </svg>
                    Edit
                  </Button>
                {/if}
              </div>
            </div>
          </Card.Header>
          <Card.Content class="flex-1 overflow-hidden p-0">
            <div class="h-full p-4 font-mono text-sm bg-black/20 overflow-auto">
              {#if isEditing}
                <Textarea
                  bind:value={fileContent}
                  class="w-full h-full min-h-[400px] font-mono text-sm bg-transparent border-0 resize-none focus:ring-0"
                />
              {:else}
                <pre class="whitespace-pre-wrap">{fileContent}</pre>
              {/if}
            </div>
          </Card.Content>
        {:else}
          <Card.Content
            class="flex-1 flex items-center justify-center text-muted-foreground"
          >
            <div class="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-12 h-12 mx-auto mb-3 opacity-50"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>Select a file to view or edit</p>
            </div>
          </Card.Content>
        {/if}
      </Card.Root>
    </div>

    <!-- Backups Section -->
    <Card.Root>
      <Card.Header class="pb-3">
        <div class="flex items-center justify-between">
          <Card.Title class="text-base">Recent Backups</Card.Title>
          <Button
            variant="outline"
            size="sm"
            onclick={() => {
              const name = `Backup - ${new Date().toLocaleString()}`;
              backups.create(selectedServerId, name, 'full');
              toasts.show('success', 'Backup created');
            }}
          >
            Create Backup
          </Button>
        </div>
      </Card.Header>
      <Card.Content class="pt-0">
        {#if serverBackups.length > 0}
          <div class="flex gap-3 overflow-x-auto pb-2">
            {#each serverBackups as backup (backup.id)}
              <div
                class="flex-shrink-0 p-3 rounded-lg bg-secondary/30 min-w-[200px]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <Badge variant="outline" class="text-xs">{backup.type}</Badge>
                  <span class="text-xs text-muted-foreground"
                    >{backup.size}</span
                  >
                </div>
                <p class="font-medium text-sm truncate">{backup.name}</p>
                <p class="text-xs text-muted-foreground">
                  {new Date(backup.createdAt).toLocaleString()}
                </p>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-sm text-muted-foreground">No backups yet</p>
        {/if}
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"
          />
        </svg>
        <h3 class="text-lg font-semibold mb-2">No server selected</h3>
        <p class="text-muted-foreground mb-4">
          Select a server to browse its files
        </p>
        {#if $servers.length === 0}
          <Button href="/servers">Create a server first</Button>
        {/if}
      </div>
    </div>
  {/if}
</div>
