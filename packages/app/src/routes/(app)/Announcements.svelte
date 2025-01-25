<script lang="ts" context="module">
  export const hiddenAnnouncements = writable<string[]>([]);
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { graphql } from '$houdini';
  import { syncToLocalStorage } from 'svelte-store2storage';
  import { writable } from 'svelte/store';
  import IconClose from '~icons/msl/close';

  $: showingTicket = /\/bookings\/\w+\/$/.exec($page.url.pathname);
  $: scanningTickets = $page.url.pathname.endsWith('/scan/');

  function announcementHiddenByUser(id: string, hiddenAnnouncements: string[]): boolean {
    return !browser || hiddenAnnouncements.includes(id);
  }
  if (browser) syncToLocalStorage(hiddenAnnouncements, 'hidden_announcements');

  const announcements = graphql(`
    subscription AnnoncementUpdates {
      announcementsNow {
        id
        title
        bodyHtml
        warning
      }
    }
  `);
  $: announcements.listen();
</script>

<section class="announcements fullsize">
  {#if !scanningTickets && !showingTicket && $announcements.data?.announcementsNow}
    {#each $announcements.data?.announcementsNow.filter(({ id }) => !announcementHiddenByUser(id, $hiddenAnnouncements)) as { title, bodyHtml, warning, id } (id)}
      <article class="announcement {warning ? 'warning' : 'primary'}">
        <div class="text">
          <strong>{title}</strong>
          <div class="body" data-user-html>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html bodyHtml}
          </div>
        </div>
        <ButtonGhost
          on:click={() => {
            $hiddenAnnouncements = [...$hiddenAnnouncements, id];
          }}
        >
          <IconClose />
        </ButtonGhost>
      </article>
    {/each}
  {/if}
</section>

<style>
  .announcements {
    display: flex;
    flex-flow: column wrap;
    view-timeline-name: announcements;
  }

  .announcement {
    display: flex;
    column-gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 2rem;
    background: var(--bg);
  }

  .announcement .body :global(p) {
    margin: 0;
  }

  @media (max-width: 900px) {
    .announcement:last-child {
      margin-bottom: 2rem;
    }

    .announcements {
      width: 100%;
    }
  }

  @media (min-width: 900px) {
    .announcements {
      position: fixed;
      right: 0;
      bottom: 0;

      /* XXX: NavigationSide's width */
      left: 90px;
      z-index: 1000;
    }

    .announcement {
      padding: 1rem 1.5rem;
    }

    .announcement:first-child {
      border-top-left-radius: var(--radius-block);
      border-top-right-radius: 0;
    }

    .announcement:last-child {
      border-bottom-right-radius: var(--radius-block);
      border-bottom-left-radius: 0;
    }
  }

  .announcement .text {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }
</style>
