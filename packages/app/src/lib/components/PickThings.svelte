<script lang="ts">
  import { ButtonPrimary, ButtonSecondary, ModalOrDrawer } from '$lib/components';
  import { loaded, loading, type MaybeLoading } from '$lib/loading';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ pick: string; finish: Value }>();

  export let multiple = false;
  // eslint-disable-next-line no-undef
  type Value = $$Generic<multiple extends true ? string[] : string | null>;
  type Option = $$Generic<{ uid: MaybeLoading<string> }>;

  export let category: undefined | ((option: Option) => { id: string; label: string }) = undefined;

  export let title = 'Choisir';

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
  export let options: Array<Option>;
</script>

<ModalOrDrawer {...$$restProps} removeBottomPadding tall bind:open bind:implicitClose={close}>
  <svelte:fragment slot="header">
    <p class="title">{title}</p>
    <!-- <InputSearchQuery bind:q /> -->
    <div class="side-by-side">
      <ButtonSecondary
        on:click={() => {
          close?.();
        }}>Annuler</ButtonSecondary
      >
      <ButtonPrimary
        on:click={() => {
          close();
          dispatch('finish', _value);
        }}>OK</ButtonPrimary
      >
    </div>
  </svelte:fragment>
  <div class="contents">
    <ul class="options nobullet" class:has-categories={Boolean(category)}>
      {#each options.filter(loaded).entries() as [i, option]}
        {@const isNewCategory =
          category && (i === 0 || category(option).id !== category(options[i - 1]).id)}
        {@const selected = isMultiple(_value)
          ? _value.includes(loading(option.uid, ''))
          : option.uid === _value}
        {#if isNewCategory && category}
          <li class="category typo-field-label">
            {category(option).label}
          </li>
        {/if}
        <li>
          <button
            class:selected
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
            <slot name="option" {selected} {option} {value} />
          </button>
        </li>
      {/each}
    </ul>
  </div>
</ModalOrDrawer>

<slot {open}>
  <ButtonSecondary on:click={open}>Choisir…</ButtonSecondary>
</slot>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    padding: 1rem;
  }

  .side-by-side {
    display: flex;
    gap: 1ch;
    align-items: center;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .options.has-categories {
    justify-content: start;
  }

  .category {
    --weight-field-label: 900;

    width: 100%;
  }

  .category:not(:first-child) {
    margin-top: 3rem;
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
</style>
