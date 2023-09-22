<script lang="ts">
  import { zeus } from '$lib/zeus';
  import IconClose from '~icons/mdi/close';
  import IconArrowRight from '~icons/mdi/arrow-right';
  import Alert from './Alert.svelte';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputText from './InputText.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import { page } from '$app/stores';
  import { isDark } from '$lib/theme';
  import { me } from '$lib/session';
  import { default as parseUserAgent } from 'ua-parser-js';
  import { CURRENT_COMMIT, CURRENT_VERSION } from '$lib/buildinfo';

  let title = '';
  let description = '';
  let issueType = 'bug';
  let link = '';
  let issueNumber = 0;
  let loading = false;
  let includeCurrentPageURL = true;
  let errored = false;

  export let element: HTMLDialogElement;

  $: link = issueNumber ? `https://git.inpt.fr/inp-net/churros/-/issues/${issueNumber}` : '';

  function formatMetadata(metadata: Record<string, string>): string {
    return Object.entries(metadata)
      .map(([key, value]) => `- **${key}:** ${value}`)
      .join('\n');
  }

  async function submitIssue() {
    loading = true;
    errored = false;
    const ua = parseUserAgent(navigator.userAgent);
    const metadata = {
      ...(includeCurrentPageURL ? { Location: $page.url.toString() } : {}),
      'Logged-in': $me ? 'Yes' : 'No',
      Version: CURRENT_VERSION,
      Build: CURRENT_COMMIT,
      Browser: `${ua.browser.name ?? 'unknown'} v${ua.browser.version ?? '?'} (engine ${
        ua.engine.name ?? 'unknown'
      } v${ua.engine.version ?? '?'})`,
      OS: `${ua.os.name ?? 'unknown'} v${ua.os.version ?? '?'}`,
      Device: `${ua.device.type ?? 'unknown'} ${ua.device.vendor ?? 'unknown'} ${
        ua.device.model ?? 'unknown'
      } (arch ${ua.cpu.architecture ?? 'unknown'})`,
    };
    try {
      const { createGitlabIssue: number } = await $zeus.mutate({
        createGitlabIssue: [
          {
            title,
            description: description + '\n\n ---- \n\n' + formatMetadata(metadata),
            isBug: issueType === 'bug',
          },
          true,
        ],
      });
      issueNumber = number;
      errored = !number;
      if (!errored) {
        title = '';
        description = '';
      }
    } catch {
      errored = true;
    }

    loading = false;
    setTimeout(() => {
      // time for <Alert> to render. Yes this is ugly hacky code, what yo gonna do bout it?
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      });
    }, 200);
  }
</script>

<svelte:window
  on:click={(e) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target === element) element.close();
  }}
/>

<dialog
  on:close={(e) => {
    if (element.classList.contains('closing')) return;

    // FIXME preventDefault() has no effect somehow
    e.preventDefault();
    element.classList.add('closing');
    setTimeout(() => {
      element.close();
      element.classList.remove('closing');
    }, 200);
  }}
  class={$isDark ? 'dark' : 'light'}
  bind:this={element}
>
  <div class="content">
    <h1>
      {#if issueType === 'bug'}Signaler{:else}Proposer{/if}
      <ButtonGhost
        on:click={() => {
          element.close();
        }}><IconClose /></ButtonGhost
      >
    </h1>
    <form on:submit|preventDefault={submitIssue}>
      <InputSelectOne
        label=""
        options={{ bug: 'Signaler un bug', feature: 'Proposer une idée' }}
        bind:value={issueType}
      />
      <InputText required bind:value={title} label="Titre" />
      <InputLongText
        label={issueType === 'bug' ? 'Comment reproduire ce bug?' : 'Décris précisément ton idée'}
        bind:value={description}
      />
      <InputCheckbox
        label="Inclure l'adresse de la page actuelle"
        bind:value={includeCurrentPageURL}
      />
      <section class="submit">
        <ButtonPrimary {loading} submits>Envoyer</ButtonPrimary>
        <p class="typo-details">
          Envoyer ce rapport créera une issue Gitlab {#if $me}en ton nom {/if}sur le dépot
          <a href="https://git.inpt.fr/inp-net/churros">git.inpt.fr/inp-net/churros</a>
        </p>
      </section>
      <section class="feedback">
        {#if link}
          <Alert theme="success"
            >Ton {#if issueType === 'bug'}bug a bien été signalé{:else}idée à bien était soumise{/if}.
            C'est <a href={link}>l'issue n°{issueNumber}</a>.
            <ButtonSecondary href={link} icon={IconArrowRight}>Voir</ButtonSecondary>
          </Alert>
        {:else if errored}
          <Alert theme="danger"
            >Impossible de créer l'issue. <ButtonSecondary
              href="https://git.inpt.fr/inp-net/churros/-/issues/new"
              >Créer l'issue sur le site</ButtonSecondary
            >
          </Alert>
        {/if}
      </section>
    </form>
  </div>
</dialog>

<style>
  dialog {
    position: fixed;
    z-index: 1000;
    min-width: calc(min(100%, 500px));
    padding: 1.5rem;
    color: var(--text);
    background: var(--bg);
    border: none;
    border-radius: var(--radius-block);
  }

  dialog:global(.closing) {
    animation: pop-up 0.5s ease reverse;
  }

  dialog[open] {
    animation: pop-up 0.25s ease;
  }

  dialog:not([open])::backdrop {
    background-color: transparent;
  }

  dialog[open]::backdrop {
    background-color: var(--backdrop);
    transition: background-color 0.5s ease;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;
    justify-content: space-between;
  }

  .submit {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }

  .submit p {
    margin: 0 2rem;
    text-align: justify;
  }

  @media (max-width: 1000px) {
    dialog {
      border-radius: 0;
    }
  }

  @keyframes pop-up {
    from {
      transform: scale(0);
    }

    to {
      transform: scale(1);
    }
  }

  @keyframes fade-in {
    from {
      background-color: transparent;
    }

    to {
      background-color: var(--backdrop);
    }
  }
</style>
