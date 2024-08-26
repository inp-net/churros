<script lang="ts" context="module">
  export async function copyToClipboard(text: string) {
    if (navigator.clipboard) {
      await navigator.clipboard
        .writeText(text)
        .then(() => {
          toasts.success('Copié', `"${text}" a été copié dans ton presse-papier`);
        })
        .catch((error) => {
          toasts.error('Impossible de copier', error);
        });
    } else {
      toasts.error('Impossible de copier', 'Ton navigateur ne supporte pas cette fonctionnalité');
    }
  }
</script>

<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { loaded, loading, type MaybeLoading } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconCopy from '~icons/msl/content-copy-outline';
  export let text: MaybeLoading<string>;
  export let label = false;
</script>

{#if label}
  <ButtonSecondary
    disabled={!loaded(text)}
    on:click={async () => copyToClipboard(loading(text, ''))}
  >
    Copier
  </ButtonSecondary>
{:else}
  <ButtonGhost
    disabled={!loaded(text)}
    help="Copier"
    on:click={async () => copyToClipboard(loading(text, ''))}
  >
    <IconCopy></IconCopy>
  </ButtonGhost>
{/if}
