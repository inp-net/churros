<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { zeus } from '$lib/zeus';
  import IconAnonymous from '~icons/mdi/anonymous';
  import IconCheck from '~icons/mdi/check';
  import IconSuccess from '~icons/mdi/check-circle-outline';
  import IconEmail from '~icons/mdi/email-outline';
  import IconHome from '~icons/mdi/home-outline';
  import IconBack from '~icons/mdi/undo-variant';
  import IconList from '~icons/mdi/view-list-outline';
  import type { PageData } from './$types';

  export let data: PageData;
  $: myAnswers = data.form?.myAnswers ?? [];

  let mailingAnswers = false;
  let answersSent = false;
  async function mailAnswers() {
    if (!data.form) return;
    mailingAnswers = true;
    try {
      const { mailFormAnswers } = await $zeus.mutate({
        mailFormAnswers: [
          { formId: data.form.id },
          {
            '__typename': true,
            '...on Error': { message: true },
            '...on MutationMailFormAnswersSuccess': { data: true },
          },
        ],
      });
      if (mailFormAnswers.__typename === 'Error') {
        toasts.error("Impossible d'envoyer les réponses", mailFormAnswers.message);
        answersSent = false;
      } else {
        toasts.success(`Réponses envoyées à ${mailFormAnswers.data}`);
        answersSent = true;
      }
    } catch {
      toasts.error(
        "Une erreur est survenue lors de l'envoi du mail. Veuillez réessayer plus tard.",
      );
      answersSent = false;
    } finally {
      mailingAnswers = false;
    }
  }
</script>

<div class="content">
  <div class="icon">
    <IconCheck></IconCheck>
  </div>
  <h1>Et voilà!</h1>
  <p>Merci d'avoir répondu au formulaire :)</p>
  <section class="actions">
    <ButtonSecondary icon={IconBack} href="../answer">Modifier mes réponses</ButtonSecondary>
    <ButtonSecondary icon={IconHome} href="/">Retour à l'accueil</ButtonSecondary>
    {#if data.form?.canSeeAnswers}
      <ButtonSecondary icon={IconList} href="../answers">Voir les réponses</ButtonSecondary>
    {/if}
  </section>
  <section class="my-answers">
    <h2>
      Mes réponses
      <ButtonSecondary
        success={answersSent}
        disabled={answersSent}
        loading={mailingAnswers}
        icon={answersSent ? IconSuccess : IconEmail}
        on:click={mailAnswers}
      >
        {#if mailingAnswers}
          Envoi en cours…
        {:else if answersSent}
          Réponses envoyées
        {:else}
          Envoyer une copie
        {/if}
      </ButtonSecondary>
    </h2>
    <dl>
      {#each myAnswers as answer (answer.id)}
        <dt>
          {answer.question.title}
          {#if answer.question.anonymous}
            <span
              class="anonymous-marker"
              use:tooltip={'Cette question est anonyme. Personne ne pourra connaître votre réponse à cette question (excepté le service technique).'}
            >
              <IconAnonymous></IconAnonymous>
            </span>
          {/if}
        </dt>
        <dd>{answer.answerString}</dd>
      {/each}
    </dl>
    <div class="actions"></div>
  </section>
</div>

<style>
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-grow: 1;
  }

  .icon {
    font-size: 3rem;
  }

  .actions {
    margin: 2rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em 1em;
  }

  h2 {
    display: flex;
    align-items: center;
    column-gap: 1em;
    justify-content: space-between;
  }
</style>
