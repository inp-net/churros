<script lang="ts">
  import IconLocation from '~icons/mdi/map-marker-outline';
  import IconCalendar from '~icons/mdi/calendar-outline';
  import { formatEventDates } from '$lib/dates';
  import { EventFrequency } from '../../zeus';
  export let title = '';
  export let description = '';
  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;
  export let location = '';
  export let frequency: EventFrequency = EventFrequency.Once;
  export let recurringUntil: Date | undefined = undefined;
</script>

<article class="preview-card">
  <img alt="Pas de miniature" class="thumb" />
  <div class="content">
    <p class:empty={!title} class="title">{title || 'Pas de titre'}</p>
    <div class:empty={!description} class="description" data-user-html="">
      {description || 'Sans description'}
    </div>
    {#if location}
      <div class="location">
        <IconLocation></IconLocation>
        {location}
      </div>
    {/if}
    {#if startsAt && endsAt}
      <div class="dates">
        <IconCalendar></IconCalendar>
        {formatEventDates(frequency, startsAt, endsAt, recurringUntil)}
      </div>
    {/if}
  </div>
</article>

<style>
  article {
    display: grid;
    grid-template-rows: 150px auto;
    width: 300px;
    height: 500px;
    overflow: hidden;
    background-color: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  article img {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 150px;
    color: #eee;
    text-align: center;
    background: #000;
  }

  article .content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }

  article .description {
    flex-grow: 1;
  }

  article .location {
    margin-top: auto;
  }

  article .title {
    font-size: 1.2em;
    font-weight: bold;
  }

  article *.empty {
    color: var(--muted-text);
  }
</style>
