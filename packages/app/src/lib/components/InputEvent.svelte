<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconPlus from '~icons/mdi/plus';
  import IconEdit from '~icons/mdi/edit';
  import IconNone from '~icons/mdi/help';
  import { type Visibility, zeus } from '$lib/zeus';
  import InputField from './InputField.svelte';
  import { formatDateTime } from '$lib/dates';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { page } from '$app/stores';
  import IndicatorVisibility from './IndicatorVisibility.svelte';
  import InputSearchObject from './InputSearchObject.svelte';

  type Event = {
    id: string;
    uid: string;
    title: string;
    pictureFile: string;
    startsAt: Date;
    visibility: Visibility;
  };
  export let groupUid: string;
  export let label: string;
  export let id: string | undefined;
  export let required = false;
  export let allow: string[] = [];
  export let except: string[] = [];
  export let event: Event | undefined = undefined;

  function allowed(uid: string) {
    const result =
      (allow.length > 0 ? allow.includes(uid) : true) &&
      (except.length > 0 ? !except.includes(uid) : true);
    return result;
  }

  async function search(query: string): Promise<Event[]> {
    const { searchEvents } = await $zeus.query({
      searchEvents: [
        { q: query, groupUid },
        {
          uid: true,
          id: true,
          title: true,
          pictureFile: true,
          startsAt: true,
          visibility: true,
        },
      ],
    });
    return searchEvents.filter(({ uid }) => allowed(uid));
  }
</script>

<InputField {label} {required}>
  <div class="side-by-side">
    <InputSearchObject {search} bind:value={id} bind:object={event} labelKey="title">
      <div class="avatar" slot="thumbnail" let:object>
        {#if object}
          <img
            src="{PUBLIC_STORAGE_URL}{object.pictureFile}"
            alt={object.title?.toString() ?? ''}
          />
        {:else}
          <IconNone />
        {/if}
      </div>
      <div class="suggestion" slot="item" let:item>
        <div class="avatar">
          <img src="{PUBLIC_STORAGE_URL}{item.pictureFile}" alt={item.title} />
        </div>
        <div class="text">
          <p class="title">{item.title}</p>
          <p class="date">{formatDateTime(item.startsAt)}</p>
        </div>
        <IndicatorVisibility visibility={item.visibility} />
      </div>
    </InputSearchObject>
    {#if event}
      <ButtonSecondary
        circle
        insideProse
        icon={IconEdit}
        href="/events/{groupUid}/{event.uid}/edit?{new URLSearchParams({
          back: $page.url.pathname,
        }).toString()}"
      />
    {:else}
      <ButtonSecondary
        circle
        icon={IconPlus}
        href="/events/{groupUid}/create?{new URLSearchParams({
          back: $page.url.pathname,
        }).toString()}"
      />
    {/if}
  </div>
</InputField>

<style lang="scss">
  .side-by-side {
    display: grid;
    flex-wrap: wrap;
    grid-template-columns: auto min-content;
    gap: 1rem;
    align-items: center;
  }

  .suggestion {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;

    .text {
      display: flex;
      flex-flow: column wrap;
    }

    .date {
      font-size: 0.75em;
      font-weight: bold;
    }

    :global(.visibility) {
      margin-left: auto;
    }
  }

  .avatar {
    --size: 2rem;

    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: calc(1.5 * var(--size));
    height: var(--size);
    overflow: hidden;
    line-height: var(--size);
    color: var(--muted-text);
    text-align: center;
    background: var(--muted-bg);
    border-radius: var(--border-block);
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
