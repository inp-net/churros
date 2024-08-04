<script lang="ts">
  import FormPicture from '$lib/components/FormPicture.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditImage } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
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
