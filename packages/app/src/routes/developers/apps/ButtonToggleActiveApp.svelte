<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';

  export let id: string;
  export let active: boolean;

  async function toggleActive() {
    await $zeus.mutate(
      active
        ? {
            deactivateApp: [{ id }, true],
          }
        : {
            activateApp: [{ id }, true],
          },
    );
    active = !active;
    toasts.success('Opération effectuée avec succès');
  }
</script>

<ButtonSecondary on:click={toggleActive}>
  {#if active}Désactiver{:else}Activer{/if}
</ButtonSecondary>
