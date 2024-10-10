<script lang="ts">
  import { graphql, type PickSchool$data } from '$houdini';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import PickThings from '$lib/components/PickThings.svelte';
  import { type MaybeLoading } from '$lib/loading';
  import type { NavigationTopStateKeys } from '$lib/navigation';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ pick: string; finish: Value }>();

  export let statebound: NavigationTopStateKeys | undefined = undefined;

  export let multiple = false;
  // eslint-disable-next-line no-undef
  type Value = $$Generic<multiple extends true ? string[] : string | null>;

  export let title = 'AEs';

  export let value: MaybeLoading<Value>;
  // let q: string;
  export let options: Array<PickSchool$data>;
  graphql(`
    fragment PickSchool on School @loading {
      uid
      id
      name
      ...AvatarSchool
    }
  `);
</script>

<PickThings
  {statebound}
  {options}
  {value}
  {multiple}
  {title}
  on:finish={(e) => dispatch('finish', e.detail)}
  on:pick={(e) => dispatch('pick', e.detail)}
  {...$$restProps}
  let:open
>
  <div class="option" class:selected slot="option" let:selected let:option>
    <AvatarSchool {selected} href="" school={option} />
    <span class="name">
      <LoadingText value={option.name} />
    </span>
  </div>

  <slot {open}></slot>
</PickThings>

<style>
  .option {
    --avatar-size: 5rem;

    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
  }

  .option .name {
    font-size: 1rem;
    text-align: center;
  }

  .option.selected {
    color: var(--primary);
  }
</style>
