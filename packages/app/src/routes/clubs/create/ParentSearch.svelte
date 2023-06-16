<script lang="ts">
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import InlineLoader from '$lib/components/loaders/InlineLoader.svelte';
  import { zeus } from '$lib/zeus';
  import { tick } from 'svelte';
  import IconCheckLine from '~icons/mdi/check';
  import IconClose from '~icons/mdi/close';
  import IconDotsHorizontal from '~icons/mdi/dots-horizontal';
  import IconPlus from '~icons/mdi/plus';

  export let parentUid: string | undefined;

  let loading = false;
  let enabled: boolean;
  let q = '';
  let options: Array<{ uid: string; name: string }> = [];

  let input: HTMLInputElement;
</script>

<FormInput label="Groupe parent :">
  {#if enabled || parentUid}
    <span>
      {#if parentUid}
        <a href="/club/{parentUid}">{parentUid}</a>
      {/if}
      {#if loading}
        <InlineLoader />
      {:else if parentUid}
        <IconCheckLine aria-label="Valeur acceptée" aria-live="polite" />
      {:else}
        <IconDotsHorizontal aria-label="Entrez un nom de groupe" />
      {/if}
      <input
        bind:this={input}
        type="search"
        list="parents"
        class="flex-1"
        placeholder="Rechercher un groupe parent"
        required
        bind:value={q}
        on:input={async () => {
          if (!q) return;
          loading = true;
          enabled = true;
          parentUid = undefined;
          try {
            const { group } = await $zeus.query({
              group: [{ uid: q }, { uid: true, name: true }],
            });
            input.setCustomValidity('');
            parentUid = group.uid;
          } catch {
            input.setCustomValidity('Veuillez entrer un groupe parent valide');
            const { searchGroups } = await $zeus.query({
              searchGroups: [{ q }, { name: true, uid: true }],
            });
            options = searchGroups;
          } finally {
            loading = false;
          }
        }}
      />
      <!-- The following span is used as a placeholder to space things a bit -->
      <span />
      <GhostButton
        title="Supprimer"
        on:click={() => {
          parentUid = undefined;
          enabled = false;
        }}
      >
        <IconClose aria-label="Supprimer" />
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
      <IconPlus aria-hidden="true" /> Définir un groupe parent
    </button>
  {/if}
</FormInput>

<datalist id="parents">
  {#each options as { uid, name }}
    <option value={uid}>{name}</option>
  {/each}
</datalist>
