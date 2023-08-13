<script lang="ts">
  import { formatRelative, isFuture, isPast } from 'date-fns';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import fr from 'date-fns/locale/fr/index.js';
  import IconChevronRight from '~icons/mdi/chevron-right';

  export let group: undefined | { name: string } = undefined;
  export let descriptionHtml: string;
  export let name: string;
  export let placesLeft: number;
  export let capacity: number;
  export let uid: string;
  export let price: number;
  export let closesAt: Date | undefined = undefined;
  export let opensAt: Date | undefined = undefined;
  export let event: { group: { uid: string }; uid: string };

  $: shotgunning =
    (!closesAt && !opensAt) ||
    (closesAt && opensAt && isFuture(new Date(closesAt)) && isPast(new Date(opensAt)));
</script>

<article class="ticket">
  <div class="text">
    <h3>
      {#if group}{group.name} <IconChevronRight /> {/if}{name}
    </h3>
    <div class="description">{@html descriptionHtml}</div>
  </div>
  <div class="numbers">
    <span class="places">
      {#if placesLeft === -1}
        Illimité
      {:else}
        <span class="left">{placesLeft}</span><span class="capacity">{capacity}</span>
      {/if}
    </span>
    {#if !shotgunning}
      <span class="price">{price}€</span>
    {/if}
  </div>
  <div class="book">
    {#if shotgunning}
      <ButtonSecondary href="/events/{event.group.uid}/{event.uid}/book/{uid}"
        >{price}€</ButtonSecondary
      >
    {/if}
  </div>
  <p class="timing typo-details">
    {#if !opensAt && !closesAt}
      Shotgun intemporel
    {:else if opensAt && isFuture(new Date(opensAt))}
      Shotgun {formatRelative(new Date(opensAt), new Date(), { locale: fr })}
    {:else if closesAt && isPast(new Date(closesAt))}
      En vente jusqu'à {formatRelative(new Date(closesAt), new Date(), { locale: fr })}
    {/if}
  </p>
</article>

<style lang="scss">
  .ticket {
    display: grid;
    grid-template-areas: 'text numbers book' 'timing timing timing';
    grid-template-columns: 1fr max-content min-content;
    column-gap: 1rem;
    align-items: center;
    padding: 1rem;
    background: var(--muted-bg);
    border-radius: var(--radius-block);

    h3 {
      display: flex;
      align-items: center;
    }

    .text {
      grid-area: text;
      width: 100%;
    }

    .book {
      grid-area: book;
    }

    .numbers {
      display: flex;
      flex-direction: column;
      grid-area: numbers;
      align-items: end;
      width: 5rem;
    }

    .timing {
      grid-area: timing;
    }
  }

  .places .left::after {
    display: inline-block;
    height: 1.25em;
    margin: 0.3em;
    margin-bottom: -0.25em;
    content: '';
    background: var(--text);
    transform: rotate(30deg);
  }

  h2 .places .left::after {
    width: 3px;
  }

  .ticket .places .left::after {
    width: 1px;
  }
</style>
