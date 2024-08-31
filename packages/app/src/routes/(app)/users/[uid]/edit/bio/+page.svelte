<script lang="ts">
  import { page } from '$app/stores';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { UpdateUserBio } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageUserEditBio } = data);
</script>

<MaybeError result={$PageUserEditBio} let:data={{ user }}>
  <div class="contents">
    <InputLongText
      on:blur={async ({ currentTarget }) => {
        if (!(currentTarget instanceof HTMLTextAreaElement)) return;
        const result = await mutate(UpdateUserBio, {
          uid: $page.params.uid,
          bio: currentTarget.value,
        });
        toasts.mutation(result, 'updateUserProfile', '', 'Impossible de mettre à jour la bio');
      }}
      label="Bio"
      rich
      value={user.description}
    ></InputLongText>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
