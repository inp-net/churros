<script lang="ts">
  import FormPicture from '$lib/components/FormPicture.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PagePostEditPicture } = data);
</script>

<MaybeError result={$PagePostEditPicture} let:data={{ post }}>
  <div class="contents">
    <FormPicture resource={post} />
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
