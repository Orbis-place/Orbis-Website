<script lang="ts">
  import { downloadAndInstallUpdate, type UpdateStatus } from '$lib/updater';

  export let updateInfo: UpdateStatus;
  export let onClose: () => void;

  let isDownloading = false;
  let downloadProgress = 0;
  let downloadTotal = 0;

  async function handleUpdate() {
    isDownloading = true;

    await downloadAndInstallUpdate((downloaded, total) => {
      downloadProgress = downloaded;
      downloadTotal = total;
    });

    // The app will automatically restart after installation
  }

  $: progressPercent =
    downloadTotal > 0
      ? Math.round((downloadProgress / downloadTotal) * 100)
      : 0;
</script>

<div
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
>
  <div
    class="bg-[#06363d] border border-[#109eb1]/30 rounded-2xl p-6 max-w-md w-full"
  >
    <h2 class="text-2xl font-bold text-[#c7f4fa] mb-2">Update Available</h2>

    <p class="text-[#c7f4fa]/80 mb-4">
      Version {updateInfo.version} is available!
    </p>

    {#if updateInfo.notes}
      <div class="bg-[#032125] rounded-lg p-4 mb-4">
        <p class="text-sm text-[#c7f4fa]/60 whitespace-pre-wrap">
          {updateInfo.notes}
        </p>
      </div>
    {/if}

    {#if isDownloading}
      <div class="mb-4">
        <div class="flex justify-between text-sm text-[#c7f4fa]/60 mb-2">
          <span>Downloading...</span>
          <span>{progressPercent}%</span>
        </div>
        <div class="w-full bg-[#032125] rounded-full h-2">
          <div
            class="bg-[#109eb1] h-2 rounded-full transition-all duration-300"
            style="width: {progressPercent}%"
          />
        </div>
      </div>
    {/if}

    <div class="flex gap-3">
      <button
        on:click={onClose}
        disabled={isDownloading}
        class="flex-1 px-4 py-2 rounded-lg border border-[#c7f4fa]/20 text-[#c7f4fa] hover:bg-[#c7f4fa]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Later
      </button>

      <button
        on:click={handleUpdate}
        disabled={isDownloading}
        class="flex-1 px-4 py-2 rounded-lg bg-[#109eb1] text-white hover:bg-[#109eb1]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? 'Installing...' : 'Update'}
      </button>
    </div>
  </div>
</div>
