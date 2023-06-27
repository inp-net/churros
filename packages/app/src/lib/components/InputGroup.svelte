<script lang="ts">
  import GhostButton from '$lib/components/ButtonGhost.svelte';
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
  import ButtonSecondary from './ButtonSecondary.svelte';

  export let uid: string | undefined;
  export let label: string;
  export let required = false;
  let pictureFile: string | undefined;

  let loading = false;
  let enabled: boolean;
  let q = '';
  let options: Array<{ uid: string; name: string; id: string; pictureFile: string }> = [];

  let input: HTMLInputElement;
</script>

<InputField {label} {required}>
  {#if enabled || uid}
    <BaseInputText
      suggestions={options.map(({ uid }) => uid)}
      type="text"
      bind:value={q}
      on:action={() => {
        uid = undefined;
        pictureFile = undefined;
        enabled = false;
      }}
      on:input={async () => {
        if (!q) {
          options = [];
          return;
        }
        loading = true;
        enabled = true;
        uid = undefined;
        pictureFile = undefined;
        try {
          const { group } = await $zeus.query({
            group: [{ uid: q }, { uid: true, name: true, id: true, pictureFile: true }],
          });
          console.log(group)
          // input.setCustomValidity('');
          uid = group.uid;
          pictureFile = group.pictureFile;
        } catch {
          // input.setCustomValidity('Veuillez entrer un groupe valide');
          const { searchGroups } = await $zeus.query({
            searchGroups: [{ q }, { name: true, uid: true, id: true, pictureFile: true }],
          });
          options = searchGroups;
        } finally {
          loading = false;
        }
      }}
      {required}
      actionIcon={IconClose}
    >
      <div slot="before">
        {#if loading}
          <InlineLoader />
        {:else if uid}
          <img src="{PUBLIC_STORAGE_URL}{pictureFile}" alt="" class="group" />
        {:else}
          <IconDotsHorizontal aria-label="Entrez un nom de groupe" />
        {/if}
      </div>
    </BaseInputText>
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
