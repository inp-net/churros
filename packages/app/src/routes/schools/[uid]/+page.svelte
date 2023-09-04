<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  $: ({ school } = data);
</script>

<div class="content">
  <header>
    <div class="picture">
      <img
        src="https://www.enseeiht.fr/skins/enseeiht-new/resources/img/logo-enseeiht.png"
        alt=""
      />
    </div>
    <h1>{school.name}</h1>
  </header>

  <section class="description">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  </section>

  <section class="board" />

  <section class="events" />
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    padding: 0 1rem;
    margin: 0 auto;
  }

  section {
    max-width: min(100%, 600px);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }

  header .picture img {
    --size: 7rem;

    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    color: var(--muted-text);
    text-align: center;
    background: var(--muted-bg);
    object-fit: contain;
  }

  header dt {
    font-weight: bold;
  }

  header dl {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;
  }

  header dd {
    margin-left: 0;
  }

  header .social-links {
    display: flex;
    gap: 0.5rem;
    font-size: 1.25em;
  }

  section h2 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .board ul {
    display: flex;
    flex-flow: column wrap;
    gap: 0.25rem;
  }

  .board li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .board li .emojis {
    font-size: 1.2em;
  }

  .board .more {
    display: flex;
    margin-top: 1rem;
  }

  @media (min-width: 1000px) {
    section h2 {
      justify-content: start;
      text-align: left;
    }

    section {
      margin: 0;
    }

    .content {
      display: grid;
      grid-template-areas: 'header header' 'description posts' 'board posts' 'subgroups events' 'related events';
      grid-template-columns: 50% 50%;
      column-gap: 5rem;
      justify-content: start;
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      grid-area: header;
    }

    section.description {
      grid-area: description;
      justify-content: start;

      :global(p) {
        text-align: left;
      }
    }

    section.posts {
      grid-area: posts;
    }

    section.board {
      grid-area: board;

      ul {
        justify-content: start;
      }
    }

    section.related {
      grid-area: related;
    }

    section.events {
      grid-area: events;
    }

    section.subgroups {
      grid-area: subgroups;
    }
  }
</style>
