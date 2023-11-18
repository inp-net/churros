<script lang="ts">
  import IconIssue from '~icons/mdi/chat-alert-outline';
  import IconMore from '~icons/mdi/dots-horizontal-circle-outline';
  import Badge from '$lib/components/Badge.svelte';
  import { IssueState } from '../../zeus';
  import type { PageData } from './$types';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import { CURRENT_VERSION } from '$lib/buildinfo';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  export let data: PageData;
</script>

<div class="content">
  <h1><ButtonBack></ButtonBack> Tes rapports</h1>

  <ul class="nobullet reports">
    {#each data.issuesByUser as { number, title, state, duplicatedFrom } (duplicatedFrom ?? number)}
      <li>
        <a href="./{number}">
          <span class="number">#{duplicatedFrom ?? number}</span>
          <span class="main">
            {#if duplicatedFrom}
              <Badge>Dupliquée de #{number}</Badge>
            {/if}
            {title}
          </span>
          {#if state === IssueState.Closed}
            <Badge theme="success">Réglé</Badge>
          {/if}
        </a>
      </li>
    {:else}
      <li class="empty">
        Aucun rapport de bug. Tu peux utiliser le bouton <IconIssue color="red"></IconIssue> pour effectuer
        un signalement.
      </li>
    {/each}
  </ul>

  {#if data.issuesByUser.length >= 20}
    <p>
      Note: seuls tes derniers 20 signalements sont affichés. Pour voir des plus anciens, rends-toi
      sur <ButtonSecondary insideProse href="https://git.inpt.fr/inp-net/churros/-/issues"
        >Notre gitlab</ButtonSecondary
      >
    </p>
  {/if}

  <h2>À propos de l'état “<Badge inline theme="success">Réglé</Badge>”</h2>
  <p class="explain-states">
    Il faut attendre jusqu'à quelques jours pour qu'un bug marqué comme <Badge
      inline
      theme="success">Réglé</Badge
    > soit effectivement réglé, le temps de mettre en ligne une nouvelle version de l'appli.
  </p>
  <p class="where-version-number">
    Le numéro de version actuel (v{CURRENT_VERSION}) de l'appli est disponible en bas de la page
    <a href="/services">
      <IconMore></IconMore> Autres services
    </a>
  </p>
</div>

<style>
  .content {
    max-width: 1000px;
    margin: 0 auto;
  }

  .reports {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
  }

  .reports li {
    padding: 0.75rem;
  }

  .reports li a {
    display: grid;
    grid-template-columns: min-content 1fr max-content;
    gap: 1rem;
    align-items: center;
  }

  .reports li:nth-child(odd) {
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .reports .number {
    font-family: var(--font-mono);
  }

  h2 {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
  }
</style>
