<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Upload, FolderOpen } from 'lucide-svelte';
  import { open } from '@tauri-apps/plugin-dialog';
  import { invoke } from '@tauri-apps/api/core';
  import { toast } from '$lib/stores/toast';
  import { saves } from '$lib/stores/saves';

  let { isOpen = $bindable(false) } = $props();

  let isDragging = $state(false);
  let isImporting = $state(false);

  async function handleFileSelect() {
    try {
      const file = await open({
        multiple: false,
        filters: [
          {
            name: 'ZIP Archive',
            extensions: ['zip'],
          },
        ],
      });

      if (file) {
        await importSave(file);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      toast.error('Failed to select file', String(error));
    }
  }

  async function importSave(filePath: string) {
    isImporting = true;
    try {
      await invoke('import_save', { zipPath: filePath });
      toast.success('Save imported successfully');
      saves.load(); // Reload saves list
      isOpen = false;
    } catch (error) {
      console.error('Error importing save:', error);
      toast.error('Failed to import save', String(error));
    } finally {
      isImporting = false;
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;

    // Tauri doesn't support DataTransfer files directly
    // We need to use the file dialog instead
    toast.warning('Please use the file selector button');
  }
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Content
    class="bg-[#06363d] border-[#084b54] text-[#c7f4fa] sm:max-w-md"
  >
    <Dialog.Header>
      <Dialog.Title class="text-2xl font-hebden text-[#c7f4fa]"
        >Import Save</Dialog.Title
      >
      <Dialog.Description class="text-[#c7f4fa]/70 font-nunito">
        Import a save from a ZIP file
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 py-4">
      <!-- Drag & Drop Zone -->
      <div
        role="button"
        tabindex="0"
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
        class="relative border-2 border-dashed rounded-xl p-8 text-center transition-colors {isDragging
          ? 'border-[#109eb1] bg-[#109eb1]/10'
          : 'border-[#084b54] hover:border-[#109eb1]/50'}"
      >
        <Upload class="mx-auto size-12 text-[#109eb1] mb-4" />
        <h3 class="text-lg font-hebden text-[#c7f4fa] mb-2">
          Drag & drop your save ZIP here
        </h3>
        <p class="text-sm text-[#c7f4fa]/60 mb-4 font-nunito">or</p>
        <Button
          onclick={handleFileSelect}
          disabled={isImporting}
          class="bg-[#109eb1] hover:bg-[#109eb1]/90 text-white font-hebden gap-2"
        >
          <FolderOpen class="size-4" />
          {isImporting ? 'Importing...' : 'Browse Files'}
        </Button>
      </div>

      <p class="text-xs text-[#c7f4fa]/50 text-center font-nunito">
        Only ZIP files are supported
      </p>
    </div>
  </Dialog.Content>
</Dialog.Root>
