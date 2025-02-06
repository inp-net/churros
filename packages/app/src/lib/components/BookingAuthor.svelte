<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import { LoadingText, allLoaded } from '$lib/loading';

  /** Whether to use the UIDs instead of the full names */
  export let shortName = false;
  $: nameProperty = (shortName ? 'uid' : 'fullName') as 'uid' | 'fullName';

  /** Show the author's email (for accountless bookings) alongside the authorName */
  export let fullAuthor = false;

  export let booking;
  $: data = fragment(
    booking,
    graphql(`
      fragment BookingAuthor on Registration @loading {
        author {
          ...AvatarUser
          uid
          fullName
        }
        authorName
        authorEmail
      }
    `),
  );
</script>

<div class="booking-author">
  {#if !allLoaded($data)}
    <LoadingText />
  {:else if $data.author}
    <AvatarUser user={$data.author} />
    {$data.author?.[nameProperty]}
  {:else if $data.authorName && fullAuthor}
    {$data.authorName} ({$data.authorEmail})
  {:else if $data.authorEmail}
    {$data.authorEmail}
  {:else}
    <span class="muted">Payeur·euse inconnu·e</span>
  {/if}
</div>

<style>
  .booking-author {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }
</style>
