<script lang="ts">
  import Modal from './Modal.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { CURRENT_VERSION } from '$lib/buildinfo';
  import { ackownledgedChangelogVersions } from '$lib/changelog';

  export let changelog: string;
  let element: HTMLDialogElement;
</script>

<Modal open maxWidth="600px" bind:element>
  <!-- eslint-disable-next-line svelte/no-at-html-tag -->
  {@html changelog}

  <section class="actions">
    <ButtonSecondary
      on:click={() => {
        element.close();
        $ackownledgedChangelogVersions = [...$ackownledgedChangelogVersions, CURRENT_VERSION];
      }}>Fermer</ButtonSecondary
    >
  </section>
</Modal>

<style>
  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
</style>
