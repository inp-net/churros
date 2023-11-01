<script lang="ts">
  import IconPlus from '~icons/mdi/plus';
  import IconEdit from '~icons/mdi/edit';
  import { type Visibility, zeus } from '$lib/zeus';
  import InputField from './InputField.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { page } from '$app/stores';
  import InputPickObjects from './InputPickObjects.svelte';

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
  export let required = false;
  export let allow: string[] = [];
  export let except: string[] = [];
  export let event: Event | undefined = undefined;
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
          uid: true,
          id: true,
          title: true,
          pictureFile: true,
          startsAt: true,
          visibility: true,
        },
      ],
    });
    return searchEvents.filter(({ uid }) => allowed(uid)).map((item) => ({ item }));
  }
</script>

<InputField {label} {required}>
  <div class="side-by-side">
    <InputPickObjects
      options={suggestions}
      {clearable}
      {search}
      pickerTitle="Choisir un évènement"
      searchKeys={['title']}
      bind:value={event}
    ></InputPickObjects>
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
</style>
