<script lang="ts">
  import { toasts } from '$lib/toasts';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconCopy from '~icons/mdi/content-copy';
  export let text: string;
</script>

<ButtonGhost
  help="Copier"
  on:click={async () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      await toasts.success('Copié', `"${text}" a été copié dans ton presse-papier`);
    } else {
      await toasts.error(
        'Impossible de copier',
        'Ton navigateur ne supporte pas cette fonctionnalité',
      );
    }
  }}
>
  <IconCopy></IconCopy>
</ButtonGhost>
