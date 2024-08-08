<script lang="ts">
  import IconCheck from '~icons/mdi/check';
  import { type Visibility, zeus } from '$lib/zeus';
  import InputPickObjects from './InputPickObjects.svelte';
  import type { Visibility$options } from '$houdini';

  type Event = {
    id: string;
    uid: string;
    title: string;
    pictureFile: string;
    startsAt: Date;
    visibility: Visibility | Visibility$options;
  };
  export let groupUid: string;
  export let allow: string[] = [];
  export let except: string[] = [];
  export let event: Event | undefined | null = undefined;
  export let suggestions: Event[] = [];
  export let clearable = false;

  function allowed(uid: string) {
    const result =
      (allow.length > 0 ? allow.includes(uid) : true) &&
      (except.length > 0 ? !except.includes(uid) : true);
    return result;
  }

  async function search(query: string) {
    const { searchEvents } = await $zeus.query({
      searchEvents: [
        { q: query, groupUid },
        {
          event: {
            uid: true,
            id: true,
            title: true,
            pictureFile: true,
            startsAt: true,
            visibility: true,
          },
        },
      ],
    });
    return searchEvents
      .filter(({ event: { uid } }) => allowed(uid))
      .map(({ event }) => ({ item: event }));
  }
</script>

<InputPickObjects
  options={suggestions}
  {clearable}
  {search}
  pickerTitle="Choisir un évènement"
  searchKeys={['title']}
  bind:value={event}
>
  <slot name="input" slot="input" let:value let:openPicker let:clear {value} {openPicker} {clear} />
  <div
    slot="item"
    let:item
    let:selected
    let:disabled
    class="suggestion"
    class:selected
    class:disabled
  >
    <div class="selected-badge" class:selected><IconCheck></IconCheck></div>
    <img src={item.pictureFile} alt={item.title} />
    <span class="name">{item.title}</span>
  </div>
</InputPickObjects>

<style lang="scss">
  .suggestion {
    --size: 5rem;

    position: relative;
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    align-items: center;
    width: calc(1.5 * var(--size));
    padding: 0.5rem;
    text-align: center;
  }

  .suggestion img {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: var(--size);
    overflow: hidden;
    color: var(--muted-text);
    text-align: center;
    object-fit: contain;
    background: var(--muted-bg);
    border: 0 solid var(--primary);
    border-radius: var(--radius-block);
    transition: all 0.25s ease;
  }

  .suggestion.disabled {
    opacity: 0.5;
  }

  .suggestion.selected img {
    border-width: calc(2 * var(--border-block));
  }

  .suggestion .selected-badge {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--primary);
    content: '';
    background: var(--primary-bg);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.125s ease;
    transform: scale(0);
  }

  .suggestion.selected .selected-badge {
    opacity: 1;
    transform: scale(1);
  }
</style>
