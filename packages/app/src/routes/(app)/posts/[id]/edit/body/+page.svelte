<script lang="ts">
  import { page } from '$app/stores';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { loading } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { ChangeBody } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ LayoutPostEdit } = data);
</script>

<MaybeError result={$LayoutPostEdit} let:data={{ post }}>
  <div class="contents">
    <InputLongText
      on:blur={async ({ currentTarget }) => {
        if (!(currentTarget instanceof HTMLTextAreaElement)) return;
        await mutateAndToast(ChangeBody, {
          post: $page.params.id,
          body: currentTarget.value,
        });
      }}
      rich
      label="Contenu"
      value={loading(post.body, 'Chargement…')}
    />
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
