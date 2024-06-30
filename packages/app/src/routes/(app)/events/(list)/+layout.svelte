<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { addDays, formatISO, parseISO, startOfWeek, subDays } from 'date-fns';
  import { tick } from 'svelte';
  import IconBackward from '~icons/mdi/chevron-left';
  import IconForward from '~icons/mdi/chevron-right';

  $: currentWeek = $page.params.monday ? parseISO($page.params.monday) : startOfWeek(new Date());

  function formatDate(d: Date) {
    try {
      return formatISO(d, { representation: 'date' });
    } catch {
      return '';
    }
  }

  beforeNavigate(async ({ to }) => {
    await tick();
    if (to?.route.id !== '/(app)/events/(list)/week/[[monday=date]]') {
      navbarElement.style.bottom = '-10rem';
    } else {
      navbarElement.style.bottom = '2rem';
    }
    await tick();
  });

  let navbarElement: HTMLDivElement;
</script>

<div class="content">
  <NavigationTabs
    data-sveltekit-preload-data="false"
    tabs={[
      {
        name: 'Semaine',
        href: '/events/week',
        active: $page.route.id?.endsWith('week/[[monday=date]]'),
      },
      { name: 'Planning', href: '/events/planning', active: $page.route.id?.endsWith('planning') },
      {
        name: 'Mes places',
        href: '/events/bookings',
        active: $page.route.id?.endsWith('bookings'),
      },
    ]}
  />
  <!-- wrapper is necessary to have position: fixed relative to position: relative parent work, see https://stackoverflow.com/a/11833892/9943464 -->
  <div data-sveltekit-preload-data="false" class="navigation" bind:this={navbarElement}>
    <!-- <div data-sveltekit-preload-data="false" class="navigation"> -->
    <a href="/events/week/{formatDate(startOfWeek(subDays(currentWeek, 7)))}">
      <IconBackward /> Précédente
    </a>
    <a href="/events/week/{formatDate(startOfWeek(new Date()))}"> Aujourd'hui</a>
    <a href="/events/week/{formatDate(startOfWeek(addDays(currentWeek, 7)))}">
      Suivante <IconForward />
    </a>
  </div>
  <slot></slot>
</div>

<style lang="scss">
  .content {
    width: 100%;
    max-width: 600px;
    padding: 0 0.5rem 4rem;
    margin: 0 auto;
  }

  .navigation {
    position: fixed;
    right: 0;
    bottom: 2rem;
    left: 0;
    z-index: 10;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-around;
    padding: 1rem 0;
    margin-bottom: 2rem;
    color: var(--text);
    background: var(--bg);
    transition: bottom 0.5s ease;
  }

  @media (min-width: $breakpoint-navbar-side) {
    .navigation {
      min-width: 600px;
      position: fixed;
      left: 50%;
      right: unset;
      transform: translateX(-50%);
      box-shadow: var(--shadow-big);
    }
  }
</style>
