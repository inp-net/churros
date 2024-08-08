<script lang="ts">
  import { graphql, type PickMajor$data } from '$houdini';
  import { LoadingText, type MaybeLoading } from '$lib/loading';
  import PickThings from './PickThings.svelte';

  export let multiple = false;
  // eslint-disable-next-line no-undef
  type Value = $$Generic<multiple extends true ? string[] : string | null>;
  export let title = 'Filières';
  export let value: MaybeLoading<Value>;

  export let options: Array<PickMajor$data>;
  graphql(`
    fragment PickMajor on Major @loading {
      uid
      id
      name
    }
  `);
</script>

<PickThings {options} {value} {multiple} {title} on:finish on:select let:open>
  <div slot="option" let:selected let:option class="option" class:selected>
    <LoadingText value={option.name} />
  </div>
</PickThings>

<style>
  .option.selected {
    color: var(--primary);
  }
</style>
