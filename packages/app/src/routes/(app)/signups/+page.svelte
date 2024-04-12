<script lang="ts">
  import { graphql } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { notNull } from '$lib/typing';
  import IconCheck from '~icons/mdi/check';
  import IconTrash from '~icons/mdi/delete-outline';
  import IconEditPen2Line from '~icons/mdi/pencil';
  import type { PageData } from './$houdini';

  export let data: PageData;

  $: ({ SignupsPage } = data);
  $: userCandidates = $SignupsPage.data?.userCandidates.nodes.filter(notNull);

  const accept = graphql(`
    mutation AcceptUserCandidate($email: String!) {
      acceptRegistration(email: $email) {
        ...List_userCandidates_remove
      }
    }
  `);

  const deny = graphql(`
    mutation DenyUserCandidate($email: String!, $reason: String!) {
      refuseRegistration(email: $email, reason: $reason) {
        ...List_userCandidates_remove
      }
    }
  `);
</script>

<h1>Demandes d'inscription</h1>
<ul class="nobullet registrations">
  {#each userCandidates ?? [] as { id, email, fullName, major, graduationYear } (id)}
    <li>
      <strong>{fullName}</strong>
      <span
        >{email} · {#if major}<abbr title="" use:tooltip={major.name}>{major.shortName}</abbr
          >{:else}exté{/if} · {graduationYear}</span
      >
      <div class="actions">
        <ButtonSecondary icon={IconEditPen2Line} href="./edit/{encodeURIComponent(email)}"
          >Modifier</ButtonSecondary
        >
        <ButtonSecondary
          on:click={async () => {
            await accept.mutate({ email }, { optimisticResponse: { acceptRegistration: { id } } });
          }}
          icon={IconCheck}
        >
          Accepter
        </ButtonSecondary>
        <ButtonSecondary
          on:click={async () => {
            // eslint-disable-next-line no-alert
            const reason = prompt('pk ?');
            if (!reason) {
              toasts.error("Il faut une raison pour refuser l'inscription");
              return;
            }

            await deny.mutate(
              { email, reason },
              { optimisticResponse: { refuseRegistration: { id } } },
            );
          }}
          icon={IconTrash}
          danger
        >
          Refuser
        </ButtonSecondary>
      </div>
    </li>
  {:else}
    <li>
      <div class="empty">
        Aucune demande d'inscription.
        <ruby>
          お<rt>o</rt>
          つ<rt>tsu</rt>
          か<rt>ka</rt>
          れ<rt>re</rt>
          さ<rt>sa</rt>
          ま<rt>ma</rt>
          で<rt>de</rt>
          す <rt>su</rt>
        </ruby>
        ～
      </div>
    </li>
  {/each}
</ul>

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  ul {
    max-width: 1000px;
    margin: 0 auto;
  }

  .registrations {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
  }

  .registrations li {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: var(--radius-block);
  }

  .registrations li .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .registrations li:nth-child(odd) {
    background: var(--muted-bg);
  }
</style>
