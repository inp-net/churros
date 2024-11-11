<script lang="ts">
  import { graphql } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { removeIdPrefix } from '$lib/typenames';
  import IconCheck from '~icons/mdi/check';
  import IconTrash from '~icons/mdi/delete-outline';
  import IconEditPen2Line from '~icons/mdi/pencil';
  import type { PageData } from './$types';

  export let data: PageData;

  // emails of registrations that are currently being accepted/refused
  let loadingRegistrations: string[] = [];

  let userCandidates = data.userCandidates.edges.map(({ node }) => node);

  const removeRow = (email: string) => {
    userCandidates = data.userCandidates.edges
      .filter(({ node }) => node.email !== email)
      .map(({ node }) => node);
  };

  async function decide(email: string, accept: boolean, why = ''): Promise<void> {
    if (loadingRegistrations.includes(email)) return;

    try {
      loadingRegistrations.push(email);
      let ok = false;
      if (accept) {
        const result = await graphql(`
          mutation AcceptUserCandidate($email: String!) {
            acceptRegistration(email: $email) {
              ...MutationErrors
              ... on MutationAcceptRegistrationSuccess {
                data {
                  email
                }
              }
            }
          }
        `).mutate({ email });

        ok = toasts.mutation(
          result,
          'acceptRegistration',
          'Inscription acceptée',
          "Impossible d'accepter l'inscription",
        );
      } else {
        const result = await graphql(`
          mutation RefuseUserCandidate($email: String!, $why: String!) {
            refuseRegistration(email: $email, reason: $why)
          }
        `).mutate({ email, why });

        if (result.data?.refuseRegistration) {
          ok = true;
          toasts.success('Inscription refusée');
        } else {
          toasts.error("Impossible de refuser l'inscription");
        }
      }

      if (ok) removeRow(email);
    } catch (error) {
      toasts.error("Erreur lors de la décision de l'inscription", error?.toString() ?? '');
    } finally {
      loadingRegistrations = loadingRegistrations.filter((e) => e !== email);
    }
  }
</script>

<h1>Demandes d'inscription</h1>
<ul class="nobullet registrations">
  {#each userCandidates as { email, fullName, major, graduationYear, id }}
    <li id={removeIdPrefix('UserCandidate', id)}>
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
            await decide(email, true);
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

            await decide(email, false, reason);
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
