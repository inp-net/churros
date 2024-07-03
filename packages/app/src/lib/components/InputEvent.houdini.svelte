<script lang="ts">
  import { graphql, type InputEvent$data } from '$houdini';
  import IconCheck from '~icons/mdi/check';
  import InputPickObjects from './InputPickObjects.svelte';
  import { toasts } from '$lib/toasts';

  /**
   * The event's group UID.
   */
  export let group: string;

  graphql(`
    fragment InputEvent on Event {
      id
      slug
      title
      pictureURL
      startsAt
      visibility
    }
  `);

  /** List of event IDs to allow or not in the selection */
  export let allow: string[] = [];
  export let except: string[] = [];
  export let event: InputEvent$data | undefined | null = undefined;
  export let suggestions: InputEvent$data[] = [];
  export let clearable = false;

  function allowed(id: string) {
    const result =
      (allow.length > 0 ? allow.includes(id) : true) &&
      (except.length > 0 ? !except.includes(id) : true);
    return result;
  }

  async function search(query: string) {
    const Search = graphql(`
      query SearchEventsInGroup($q: String!, $groupUid: String!) {
        searchEvents(q: $q, groupUid: $groupUid) {
          event {
            ...InputEvent @mask_disable
          }
        }
      }
    `);
    const result = await Search.fetch({ variables: { q: query, groupUid: group } });
    if (!result.data) {
      toasts.error("Erreur lors de la recherche d'évènements.");
      return [];
    }
    return result.data.searchEvents
      .filter(({ event: { id } }) => allowed(id))
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
    <img src={item.pictureURL} alt={item.title} />
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
    border: 0 solid var(--primary-border);
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
    color: var(--primary-text);
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
