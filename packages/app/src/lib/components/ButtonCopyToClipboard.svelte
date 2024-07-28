<script lang="ts" context="module">
  export function copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toasts.success('Copié', `"${text}" a été copié dans ton presse-papier`);
    } else {
      toasts.error('Impossible de copier', 'Ton navigateur ne supporte pas cette fonctionnalité');
    }
  }
</script>

<script lang="ts">
  import { toasts } from '$lib/toasts';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconCopy from '~icons/mdi/content-copy';
  export let text: string;
</script>

<ButtonGhost help="Copier" on:click={() => copyToClipboard(text)}>
  <IconCopy></IconCopy>
</ButtonGhost>
