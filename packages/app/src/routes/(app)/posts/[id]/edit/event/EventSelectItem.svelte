<script lang="ts">
  import type { PagePostEditLinkedEvent_Event$data } from '$houdini';
  import HtmlContent from '$lib/components/HTMLContent.svelte';
  import TextEventDates from '$lib/components/TextEventDates.svelte';
  import {
    type DeepMaybeLoading,
    type MaybeLoading,
    loading,
    LoadingText,
    mapLoading,
  } from '$lib/loading';
  import { xss } from '$lib/xss';
  import { createEventDispatcher } from 'svelte';
  import IconDates from '~icons/msl/calendar-month-outline';
  import IconLocation from '~icons/msl/location-on-outline';

  const dispatch = createEventDispatcher<{ select: string | null }>();

  export let event: DeepMaybeLoading<PagePostEditLinkedEvent_Event$data>;
  export let selected: MaybeLoading<boolean> = false;
</script>

<label for="linked-event-{loading(event.id, '')}" class:selected>
  <input
    type="radio"
    name="linked-event"
    id="linked-event-{loading(event.id, '')}"
    value={loading(event?.id, '') === loading(event.id, null)}
    on:change={() => dispatch('select', loading(event.id, null))}
  />
  <div class="title">
    <HtmlContent tag="span" html={mapLoading(event.title, xss)} />
  </div>
  <div class="metadata">
    <div>
      <IconDates />
      <TextEventDates {event} />
    </div>
    <div>
      <IconLocation />
      <LoadingText value={event.location} />
    </div>
  </div>
</label>

<style>
  input[type='radio'] {
    display: none;
  }

  label {
    display: flex;
    flex-direction: column;
    padding: 1rem 2rem;
    cursor: pointer;
    background: var(--bg2);
    border-radius: var(--radius-block);
    outline: 0 solid var(--primary);
    transition: all 100ms ease;
  }

  label.selected {
    background: var(--primary-bg);
    outline-width: calc(3 * var(--border-block));
  }

  label:not(.selected):hover,
  label:not(.selected):focus-visible {
    outline-width: calc(4 * var(--border-block));
  }

  label .metadata {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }

  label .metadata > div {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
