<script lang="ts">
  import { CardBooking, MaybeError } from '$lib/components';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageMyBookings } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageMyBookings} let:data={{ me }}>
  <div class="contents">
    <ul class="nobullets bookings">
      {#each me.bookings.nodes as booking}
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
</style>
