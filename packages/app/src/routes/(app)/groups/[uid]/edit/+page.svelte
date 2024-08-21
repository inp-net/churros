<script lang="ts">
  import type { PageData } from './$houdini';
  import FormGroup from '$lib/components/FormGroup.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';

  export let data: PageData;
  $: ({ PageGroupEdit } = data);
</script>

<MaybeError result={$PageGroupEdit} let:data={{ group }}>
  <div class="forms">
    <div class="logos">
      <FormPicture resource={group} />
    </div>
    <FormGroup {group} />
  </div>
</MaybeError>

<style>
  .forms {
    display: flex;
    flex-flow: column wrap;
    gap: 3rem;
  }

  .logos {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
</style>
