<script lang="ts">
  import { page } from '$app/stores';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import { mutateAndToast } from '$lib/mutations';
  import { SetGroupType } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageGroupEditType } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageGroupEditType} let:data={{ group }}>
  <div class="contents">
    <InputRadios
      on:change={async ({ detail }) => {
        await mutateAndToast(
          SetGroupType,
          { type: detail, uid: $page.params.uid },
          { error: 'Impossible de changer le type de groupe' },
        );
      }}
      options={DISPLAY_GROUP_TYPES}
      value={group.type}
    >
      <div slot="label" class="option" let:option>
        <span class="display">{DISPLAY_GROUP_TYPES[option]}</span>
        <!-- TODO: -->
        <!-- <p class="explanation muted"></p> -->
      </div>
    </InputRadios>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
