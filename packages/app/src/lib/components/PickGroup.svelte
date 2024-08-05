<script lang="ts">
  import { graphql, type PickGroup$data } from '$houdini';
  import {
    AvatarGroup_houdini,
    ButtonPrimary,
    ButtonSecondary,
    LoadingText,
    ModalOrDrawer,
  } from '$lib/components';
  import { loaded, loading, type MaybeLoading } from '$lib/loading';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ pick: string; finish: Value }>();

  export let multiple = false;
  // eslint-disable-next-line no-undef
  type Value = $$Generic<multiple extends true ? string[] : string | null>;

  export let title = 'Choisir un groupe';

  export let value: MaybeLoading<Value>;
  // @ts-expect-error "could be instanciated with a different type"
  let _value: Value = multiple ? ([] as string[]) : null;

  // @ts-expect-error "could be instanciated with a different type"
  function isMultiple(value: Value): value is string[] {
    return multiple;
  }

  $: if (loaded(value)) _value = value;

  let open: () => void;
  let close: () => void;
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

<ModalOrDrawer tall bind:open bind:implicitClose={close}>
  <div class="contents">
    <header>
      <p class="title">{title}</p>
      <!-- <InputSearchQuery bind:q /> -->
      <ButtonPrimary
        on:click={() => {
          close();
          dispatch('finish', _value);
        }}>OK</ButtonPrimary
      >
    </header>
    <ul class="groups nobullet">
      {#each options.filter(loaded) as option}
        {@const selected = isMultiple(_value)
          ? _value.includes(loading(option.uid, ''))
          : option.uid === _value}
        <li>
          <button
            class:selected
            class="option"
            on:click={() => {
              if (!loaded(option.uid)) return;
              dispatch('pick', option.uid);
              if (isMultiple(_value)) {
                // @ts-expect-error "could be instanciated with a different type"
                _value = _value.includes(option.uid)
                  ? _value.filter((v) => v !== option.uid)
                  : [..._value, option.uid];
              } else {
                // @ts-expect-error "could be instanciated with a different type"
                _value = option.uid;
                dispatch('finish', _value);
                close();
              }
            }}
          >
            <AvatarGroup_houdini {selected} href="" group={option} />
            <span class="name">
              <LoadingText value={option.name} />
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</ModalOrDrawer>

<slot {open}>
  <ButtonSecondary on:click={open}>Choisir un groupe</ButtonSecondary>
</slot>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    padding: 1rem;
  }

  .groups {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    max-height: 70dvh;
    overflow-y: scroll;
  }

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

  header {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
</style>
