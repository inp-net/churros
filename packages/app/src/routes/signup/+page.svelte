<script lang="ts">
  import { MaybeError } from '$lib/components';
  import type { PageData } from './$houdini';
  import FormSignup from './FormSignup.svelte';

  export let data: PageData;
  $: ({ PageSignup } = data);
</script>

<MaybeError result={$PageSignup} let:data>
  <div class="contents">
    <FormSignup {data} quickSignup={null} />
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
