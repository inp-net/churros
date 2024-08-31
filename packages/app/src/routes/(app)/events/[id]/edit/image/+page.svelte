<script lang="ts">
  import FormPicture from '$lib/components/FormPicture.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditImage } = data);
</script>

<MaybeError result={$PageEventEditImage} let:data={{ event }}>
  <div class="contents">
    <p class="typo-field-label">Image de fond</p>
    <FormPicture resource={event} />
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .typo-field-label {
    --weight-field-label: 800;
  }
</style>
