<script lang="ts">
  import CardBooking from '$lib/components/CardBooking.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { infinitescroll } from '$lib/scroll';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageMyBookings } = data);
</script>

<MaybeError result={$PageMyBookings} let:data={{ me }}>
  <div class="contents">
    <ul class="nobullets bookings" use:infinitescroll={async () => PageMyBookings.loadNextPage()}>
      {#each me.bookings.edges as { node: booking }}
        <li class="booking">
          <CardBooking {booking} />
        </li>
      {/each}
    </ul>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  ul.bookings {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
