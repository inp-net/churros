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
  <div class="text-and-numbers">
    <div class="text">
      <h3>
        {#if group}{group.name} <IconChevronRight /> {/if}{name}
      </h3>
      <div class="description">{@html descriptionHtml}</div>
    </div>
    <div class="numbers">
      <span class="places">
        {#if placesLeft === -1 || placesLeft === Number.POSITIVE_INFINITY}
          Illimité
        {:else}
          <span class="left">{placesLeft}</span><span class="capacity">{capacity}</span>
        {/if}
      </span>
      {#if !shotgunning}
        <span class="separator">·</span>
      {/if}
      <div class="price">
        {#if shotgunning}
          <ButtonSecondary href="/events/{event.group.uid}/{event.uid}/book/{uid}"
            >{price}€</ButtonSecondary
          >
        {:else}
          {price}€
        {/if}
      </div>
    </div>
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
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    padding: 1rem;
    background: var(--muted-bg);
    border-radius: var(--radius-block);

    h3 {
      display: flex;
      align-items: center;
    }

    .text-and-numbers {
      display: flex;
      flex-wrap: wrap;
      row-gap: 1rem;
      column-gap: 0.5rem;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .numbers {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: center;
    }

    .book {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .timing {
      font-weight: normal;
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
