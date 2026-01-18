<script lang="ts">
  import {
    Avatar,
    AvatarImage,
    AvatarFallback,
  } from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import type { ResourceComment } from '$lib/types/mod';
  import { MessageCircle, Reply, Trash2, Flag } from 'lucide-svelte';

  export let comments: ResourceComment[] = [];
  export let total: number = 0;
  export let totalPages: number = 0;
  export let page: number = 1;
  export let onPageChange: (newPage: number) => void;
  export let isLoading: boolean = false;

  const MAX_COMMENT_LENGTH = 500;
  let expandedComments = new Set<string>();

  function toggleExpand(id: string) {
    if (expandedComments.has(id)) {
      expandedComments.delete(id);
    } else {
      expandedComments.add(id);
    }
    expandedComments = expandedComments; // Trigger update
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }
</script>

<div class="bg-[#06363d] border border-[#084b54] rounded-2xl p-6">
  <!-- Header -->
  <div class="flex items-center gap-2 mb-6">
    <MessageCircle class="w-5 h-5 text-[#109eb1]" />
    <h2 class="font-hebden text-xl font-semibold text-[#c7f4fa]">
      Comments
      {#if total > 0}
        <span class="text-[#c7f4fa]/50">({total})</span>
      {/if}
    </h2>
  </div>

  {#if isLoading}
    <div class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#109eb1]"
      ></div>
    </div>
  {:else if comments.length === 0}
    <div class="text-center py-8 text-[#c7f4fa]/40">
      <MessageCircle class="w-12 h-12 mx-auto mb-2 opacity-40" />
      <p class="font-nunito">No comments yet</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each comments as comment}
        <div class="bg-[#032125] rounded-xl border border-[#084b54] p-4">
          <div class="flex items-start gap-3">
            <Avatar class="size-9 border border-[#084b54]">
              <AvatarImage
                src={comment.user.image}
                alt={comment.user.displayName || comment.user.username}
              />
              <AvatarFallback
                class="bg-[#109eb1] text-white font-medium text-sm"
              >
                {(comment.user.displayName ??
                  comment.user.username)[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-nunito font-semibold text-[#c7f4fa]">
                  {comment.user.displayName || comment.user.username}
                </span>
                <span class="text-[#c7f4fa]/50 text-sm">·</span>
                <span class="text-[#c7f4fa]/50 text-sm">
                  {formatTimeAgo(comment.createdAt)}
                </span>
                {#if comment.version}
                  <span class="text-[#c7f4fa]/50 text-sm">·</span>
                  <span
                    class="text-xs bg-[#109eb1]/20 text-[#109eb1] px-2 py-0.5 rounded-full font-nunito"
                  >
                    v{comment.version.versionNumber}
                  </span>
                {/if}
              </div>

              <div
                class="text-[#c7f4fa]/80 mt-1 whitespace-pre-wrap font-nunito break-words"
              >
                {#if comment.content.length > MAX_COMMENT_LENGTH && !expandedComments.has(comment.id)}
                  {comment.content.slice(0, MAX_COMMENT_LENGTH)}...
                  <button
                    class="text-[#109eb1] hover:text-[#109eb1]/80 text-sm font-nunito ml-1"
                    on:click={() => toggleExpand(comment.id)}
                  >
                    See more
                  </button>
                {:else}
                  {comment.content}
                  {#if comment.content.length > MAX_COMMENT_LENGTH}
                    <button
                      class="text-[#109eb1] hover:text-[#109eb1]/80 text-sm font-nunito ml-1 block mt-1"
                      on:click={() => toggleExpand(comment.id)}
                    >
                      See less
                    </button>
                  {/if}
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}

      {#if totalPages > 1}
        <div class="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            class="border-[#084b54] text-[#c7f4fa] hover:bg-[#084b54]"
            on:click={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span
            class="px-3 py-1 text-[#c7f4fa]/50 font-nunito flex items-center"
          >
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            class="border-[#084b54] text-[#c7f4fa] hover:bg-[#084b54]"
            on:click={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      {/if}
    </div>
  {/if}
</div>
