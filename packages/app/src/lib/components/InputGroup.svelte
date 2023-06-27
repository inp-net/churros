<script lang="ts">
  import GhostButton from '$lib/components/ButtonGhost.svelte';
  import BaseInputText from '$lib/components/BaseInputText.svelte';
  import InlineLoader from '$lib/components/LoaderInline.svelte';
  import { zeus } from '$lib/zeus';
  import { tick } from 'svelte';
  import IconCheckLine from '~icons/mdi/check';
  import IconClose from '~icons/mdi/close';
  import IconDotsHorizontal from '~icons/mdi/dots-horizontal';
  import IconPlus from '~icons/mdi/plus';
  import BaseInputText from './BaseInputText.svelte';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import InputField from './InputField.svelte';

  export let uid: string | undefined;
  export let label: string;
  export let required = false;
  let pictureFile: string | undefined;

  let pictureFile: string | undefined;
  let loading = false;
  let enabled: boolean;
  let q = '';
  let options: Array<{ uid: string; name: string; id: string }> = [];

  let input: HTMLInputElement;
</script>

<InputField {label} {required}>
  {#if enabled || uid}
    <span>
      {#if uid}
        <a href="/club/{uid}">{uid}</a>
      {/if}
      {#if loading}
        <InlineLoader />
      {:else if uid}
        <IconCheckLine aria-label="Valeur acceptée" aria-live="polite" />
      {:else}
        <IconDotsHorizontal aria-label="Entrez un nom de groupe" />
      {/if}
      <input
        bind:this={input}
        type="search"
        list="parents"
        class="flex-1"
        placeholder="Rechercher un groupe"
        required={required && !uid}
        bind:value={q}
        on:input={async () => {
          if (!q) return;
          loading = true;
          enabled = true;
          uid = undefined;
          try {
            const { group } = await $zeus.query({
              group: [{ uid: q }, { uid: true, name: true, id: true }],
            });
            input.setCustomValidity('');
            uid = group.uid;
          } catch {
            input.setCustomValidity('Veuillez entrer un groupe valide');
            const { searchGroups } = await $zeus.query({
              searchGroups: [{ q }, { name: true, uid: true, id: true }],
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
          uid = undefined;
          enabled = false;
        }}
      >
        <IconClose aria-label="Supprimer" />
      </GhostButton>
    </span>
  {:else}
    <ButtonSecondary
      icon={IconPlus}
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
      <slot />
    </ButtonSecondary>
  {/if}
</InputField>
