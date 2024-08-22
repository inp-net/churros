<script lang="ts">
  import MaybeError from '$lib/components/MaybeError.svelte';
  import FormSignup, { type Args } from '../FormSignup.svelte';
  import type { PageData } from './$houdini';
  import type { Snapshot } from './$types';

  export let data: PageData;
  let args: Args;
  export const snapshot: Snapshot = {
    capture() {
      return args;
    },
    restore(snapshot) {
      args = snapshot;
    },
  };

  $: ({ PageQuickSignup } = data);
</script>

<MaybeError result={$PageQuickSignup} let:data>
  <div class="contents">
    <FormSignup bind:args {data} quickSignup={data.quickSignup}></FormSignup>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
