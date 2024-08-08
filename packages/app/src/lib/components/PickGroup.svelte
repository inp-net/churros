<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { graphql, type PickGroup$data } from '$houdini';
  import { AvatarGroup_houdini, LoadingText } from '$lib/components';
  import PickThings from '$lib/components/PickThings.svelte';
  import { type MaybeLoading } from '$lib/loading';

  const dispatch = createEventDispatcher<{ pick: string; finish: Value }>();

  export let multiple = false;
  // eslint-disable-next-line no-undef
  type Value = $$Generic<multiple extends true ? string[] : string | null>;

  export let title = 'Groupes';
  export let open: () => void;

  export let value: MaybeLoading<Value>;
  // let q: string;
  export let options: Array<PickGroup$data>;
  graphql(`
    fragment PickGroup on Group @loading {
      uid
      id
      name
      ...AvatarGroup
    }
  `);
</script>

<PickThings
  {options}
  {value}
  {multiple}
  {title}
  on:finish={(e) => dispatch('finish', e.detail)}
  on:pick={(e) => dispatch('pick', e.detail)}
  bind:open 
  {...$$restProps}
>
  <div class="option" class:selected slot="option" let:selected let:option>
    <AvatarGroup_houdini {selected} href="" group={option} />
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
