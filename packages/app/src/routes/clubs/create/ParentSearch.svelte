<script lang="ts">
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import InlineLoader from '$lib/components/loaders/InlineLoader.svelte';
  import { zeus } from '$lib/zeus';
  import { tick } from 'svelte';
  import MajesticonsCheckLine from '~icons/majesticons/check-line';
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsDotsHorizontal from '~icons/majesticons/dots-horizontal';
  import MajesticonsPlus from '~icons/majesticons/plus';

  export let parentUid: string | undefined;

  let loading = false;
  let enabled = false;
  let q = '';
  let options: Array<{ uid: string; name: string }> = [];

  let input: HTMLInputElement;
</script>

<FormInput label="Groupe parent :">
  {#if enabled}
    <span>
      <input
        bind:this={input}
        type="search"
        list="parents"
        class="flex-1"
        required
        bind:value={q}
        on:input={async () => {
          if (!q) return;
          loading = true;
          parentUid = undefined;
          try {
            const { group } = await $zeus.query({
              group: [{ uid: q }, { uid: true, name: true }],
            });
            input.setCustomValidity('');
            parentUid = group.uid;
          } catch {
            input.setCustomValidity('Veuillez entrer un groupe parent valide');
            const { searchGroup } = await $zeus.query({
              searchGroup: [{ q, first: 10 }, { edges: { node: { uid: true, name: true } } }],
            });
            options = searchGroup.edges.map(({ node }) => node);
          } finally {
            loading = false;
          }
        }}
      />
      <!-- The following span is used as a placeholder to space things a bit -->
      <span />
      {#if loading}
        <InlineLoader />
      {:else if parentUid}
        <MajesticonsCheckLine aria-label="Valeur acceptée" aria-live="polite" />
      {:else}
        <MajesticonsDotsHorizontal aria-label="Entrez un nom de groupe" />
      {/if}
      <GhostButton
        title="Supprimer"
        on:click={() => {
          parentUid = undefined;
          enabled = false;
        }}
      >
        <MajesticonsClose aria-label="Supprimer" />
      </GhostButton>
    </span>
  {:else}
    <button
      type="button"
      on:click={async () => {
        if (input === null) {
          // @ts-expect-error Tricking TS into thinking that input is always defined
          input = undefined;
          return;
        }

        enabled = true;
        await tick();
        input.focus();
      }}
    >
      <MajesticonsPlus aria-hidden="true" /> Définir un groupe parent
    </button>
  {/if}
</FormInput>

<datalist id="parents">
  {#each options as { uid, name }}
    <option value={uid}>{name}</option>
  {/each}
</datalist>
