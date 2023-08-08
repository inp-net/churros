<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import ArticleCard from '$lib/components/CardArticle.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { pageQuery } from './+page';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import CarouselGroups from '$lib/components/CarouselGroups.svelte';
  import { me } from '$lib/session';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  export let data: PageData;

  let loading = false;
  let selectedBirthdaysYearTier = $me?.yearTier?.toString() ?? 'all';
  const loadMore = async () => {
    if (loading) return;
    try {
      loading = true;
      const { homepage } = await $zeus.query({
        homepage: [{ after: data.homepage.pageInfo.endCursor }, pageQuery],
      });
      data.homepage.pageInfo = homepage.pageInfo;
      data.homepage.edges = [...data.homepage.edges, ...homepage.edges];
    } finally {
      loading = false;
    }
  };
</script>

<h1>Mon feed</h1>

<section class="groups">
  {#if $me?.groups}
    <CarouselGroups groups={$me.groups.map(({ group }) => group)} />
  {/if}
</section>

{#if data.birthdays}
  <section class="birthdays">
    <h1>
      Anniversaires
      <InputSelectOne
        bind:value={selectedBirthdaysYearTier}
        label=""
        options={{ 1: '1As', 2: '2As', 3: '3As', all: 'Tous' }}
      />
      <ButtonSecondary href="/birthdays">Autres jours</ButtonSecondary>
    </h1>
    <ul class="nobullet">
      {#each data.birthdays.filter((u) => (selectedBirthdaysYearTier === 'all' || u.yearTier === Number.parseFloat(selectedBirthdaysYearTier)) && u.major.schools.some( (s) => $me?.major.schools.some((schoolMe) => schoolMe.uid === s.uid) )) as { uid, major, birthday, ...user } (uid)}
        <li>
          <AvatarPerson
            href="/user/{uid}"
            {...user}
            role="{major.shortName} · {new Date().getFullYear() -
              (birthday?.getFullYear() ?? 0)} ans"
          />
        </li>
      {:else}
        <li>Aucun·e {selectedBirthdaysYearTier}A n'est né·e aujourd'hui :/</li>
      {/each}
    </ul>
  </section>
{/if}

<section class="articles">
  {#each data.homepage.edges as { cursor, node: { uid, title, bodyHtml, publishedAt, group, author, pictureFile, links, body } }}
    <ArticleCard
      {title}
      {publishedAt}
      {links}
      {group}
      {author}
      {bodyHtml}
      href="/club/{group.uid}/post/{uid}/"
      img={pictureFile ? { src: `${PUBLIC_STORAGE_URL}${pictureFile}` } : undefined}
    />
  {/each}
</section>

{#if data.homepage.pageInfo.hasNextPage}
  <p class="text-center"><Button on:click={loadMore} {loading}>Voir plus</Button></p>
{/if}

<style>
  h1 {
    text-align: center;
  }

  section.groups {
    display: flex;
    justify-content: center;
    margin-bottom: 3rem;
  }

  section.articles {
    max-width: 600px;
    margin: 0 auto;
  }

  section.birthdays h1 {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  section.birthdays ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: center;
    margin-top: 1rem;
  }

  section.birthdays {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
