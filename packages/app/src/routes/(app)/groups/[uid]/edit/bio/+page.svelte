<script lang="ts">
  import { page } from '$app/stores';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { mutateAndToast } from '$lib/mutations';
  import { SetGroupBio } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageGroupEditBio } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageGroupEditBio} let:data={{ group }}>
  <div class="contents">
    <InputLongText
      on:blur={async ({ currentTarget }) => {
        if (!(currentTarget instanceof HTMLTextAreaElement)) return;
        mutateAndToast(
          SetGroupBio,
          { uid: $page.params.uid, bio: currentTarget.value },
          { error: 'Impossible de mettre à jour la bio' },
        );
      }}
      label="Bio"
      rich
      value={group.longDescription}
    />
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
