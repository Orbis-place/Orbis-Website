<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Image from '@tiptap/extension-image';
  import Link from '@tiptap/extension-link';
  import Underline from '@tiptap/extension-underline';

  let { content, class: className = '' } = $props<{
    content: string;
    class?: string;
  }>();

  let element = $state<HTMLElement>();
  let editor = $state<Editor>();

  onMount(() => {
    editor = new Editor({
      element: element,
      editable: false,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3, 4],
          },
        }),
        Image.configure({
          inline: true,
          HTMLAttributes: {
            class: 'rounded-lg max-w-full h-auto my-4',
          },
        }),
        Link.configure({
          openOnClick: true,
          HTMLAttributes: {
            class:
              'text-[#109EB1] underline underline-offset-2 hover:text-[#109EB1]/80 transition-colors',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
        Underline,
      ],
      editorProps: {
        attributes: {
          class: `tiptap font-nunito text-base leading-relaxed text-[#c7f4fa]/90 focus:outline-none ${className}`,
        },
      },
      content: content,
    });
  });

  $effect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div bind:this={element} class="tiptap-container"></div>

<style>
  /* Base styles matching web app globals.css */
  :global(.tiptap) {
    color: #c7f4fa; /* var(--foreground) */
  }

  :global(.tiptap.ProseMirror) {
    color: #c7f4fa;
  }

  :global(.tiptap h1),
  :global(.tiptap h2),
  :global(.tiptap h3),
  :global(.tiptap h4),
  :global(.tiptap h5),
  :global(.tiptap h6) {
    color: #c7f4fa;
    font-family: 'Hebden', sans-serif;
    font-weight: 700;
    margin-bottom: 0.5em;
  }

  :global(.tiptap h1) {
    font-size: 2em;
  }
  :global(.tiptap h2) {
    font-size: 1.5em;
  }
  :global(.tiptap h3) {
    font-size: 1.25em;
  }

  :global(.tiptap p) {
    color: #c7f4fa;
    margin: 1em 0;
  }

  :global(.tiptap strong),
  :global(.tiptap b) {
    color: #c7f4fa;
    font-weight: 700;
  }

  :global(.tiptap em),
  :global(.tiptap i) {
    color: #c7f4fa;
  }

  :global(.tiptap u) {
    color: #c7f4fa;
  }

  :global(.tiptap s) {
    color: #c7f4fa/80;
  }

  :global(.tiptap ul),
  :global(.tiptap ol) {
    color: #c7f4fa;
    padding-left: 1.5em;
    margin: 1em 0;
    list-style-position: outside;
  }

  :global(.tiptap ul) {
    list-style-type: disc;
  }

  :global(.tiptap ol) {
    list-style-type: decimal;
  }

  :global(.tiptap li) {
    color: #c7f4fa;
    margin: 0.25em 0;
  }

  :global(.tiptap li::marker) {
    color: #109eb1;
  }

  :global(.tiptap blockquote) {
    color: #c7f4fa/90; /* rgba(199, 244, 250, 0.9) */
    border-left: 4px solid #109eb1;
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
  }

  :global(.tiptap code) {
    color: #109eb1;
    background-color: rgba(16, 158, 177, 0.15);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.9em;
  }

  :global(.tiptap pre) {
    background-color: #0a1f24;
    border: 1px solid #1e5a63;
    border-radius: 8px;
    padding: 1em;
    overflow-x: auto;
    margin: 1em 0;
  }

  :global(.tiptap pre code) {
    color: #c7f4fa;
    background-color: transparent;
    padding: 0;
    border-radius: 0;
  }

  :global(.tiptap a) {
    color: #109eb1;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :global(.tiptap a:hover) {
    color: #0d8a9a;
  }

  :global(.tiptap hr) {
    border: none;
    border-top: 1px solid #1e5a63;
    margin: 2em 0;
  }

  :global(.tiptap img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1em 0;
  }
</style>
