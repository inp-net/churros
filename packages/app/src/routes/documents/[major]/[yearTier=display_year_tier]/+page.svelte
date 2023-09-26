<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardSubject from '$lib/components/CardSubject.svelte';
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  export let data: PageData;

  const minors = Object.values(
    Object.fromEntries(
      data.subjectsOfMajor.edges.flatMap(({ node }) => node.minors).map((m) => [m.uid, m]),
    ),
  );

  function subjectsSorter(
    a: { nextExamAt?: Date | undefined },
    b: { nextExamAt?: Date | undefined },
  ) {
    if (!a.nextExamAt) return -1;
    if (!b.nextExamAt) return 1;
    return a.nextExamAt.getTime() - b.nextExamAt.getTime();
  }

  function subjectsOfMinor(minor: undefined | { uid: string }) {
    return data.subjectsOfMajor.edges
      .filter(({ node }) =>
        minor === undefined
          ? node.minors.length === 0
          : node.minors.some((m) => m.uid === minor.uid),
      )
      .sort(subjectsSorter);
  }
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb href="..">{data.major.shortName}</Breadcrumb>
  <Breadcrumb>{$page.params.yearTier.toUpperCase()}</Breadcrumb>
</Breadcrumbs>

{#if minors.length > 1}
  {#if $me?.minor}
    <h2>{$me.minor.name}</h2>
    <ul class="nobullet">
      {#each subjectsOfMinor($me.minor) as { node } (node.uid)}
        <li>
          <CardSubject href="./{node.uid}" majors={[]} {...node}></CardSubject>
        </li>
      {:else}
        <li class="empty muted">Aucune matière dans ta filière??? Contactes net7.</li>
      {/each}
    </ul>
  {:else if browser && localStorage.getItem('ignoreDefineYourMinor') !== 'true'}
    <div class="define-your-minor">
      <p class="muted">
        Marre de scroll pour avoir sa filière? Définis ta filière mineure dans <a href="/me"
          >ton&nbsp;profil</a
        >
      </p>
      <ButtonSecondary
        on:click={() => {
          localStorage.setItem('ignoreDefineYourMinor', 'true');
        }}>Ignorer</ButtonSecondary
      >
    </div>
    <hr />
  {/if}
{/if}

{#if subjectsOfMinor(undefined).length > 0}
  <ul class="nobullet minorless-subjects">
    {#each subjectsOfMinor(undefined) as { node } (node.id)}
      <li>
        <CardSubject href="./{node.uid}" majors={[]} {...node}></CardSubject>
      </li>
    {/each}
  </ul>
{/if}

{#each minors.filter((m) => m.uid !== $me?.minor?.uid) as minor}
  {#if minors.length > 1}
    <h2>{minor.name}</h2>
  {/if}

  <ul class="nobullet">
    {#each subjectsOfMinor(minor) as { node } (node.id)}
      <li>
        <CardSubject href="./{node.uid}" majors={[]} {...node}></CardSubject>
      </li>
    {/each}
  </ul>
{/each}

<style lang="scss">
  h2 {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .define-your-minor {
    width: 100%;
    padding: 1rem;
    margin-top: 2rem;
    text-align: center;
    border: var(--border-block) dashed var(--border);
    border-radius: var(--radius-block);

    p {
      margin-bottom: 0.5rem;
    }
  }

  .minorless-subjects {
    margin-top: 2rem;
  }

  hr {
    margin: 3rem auto;
  }

  hr + h2 {
    margin-top: 0;
  }
</style>
