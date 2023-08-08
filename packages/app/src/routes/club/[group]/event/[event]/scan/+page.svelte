<script lang="ts">
  import IconChevronRight from '~icons/mdi/chevron-right';
  import IconClose from '~icons/mdi/close';
  import IconCheck from '~icons/mdi/check';
  import { type PaymentMethod, zeus } from '$lib/zeus';
  import { onDestroy, onMount } from 'svelte';
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { theme } from '$lib/theme';
  import Card from '$lib/components/Card.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';

  let manualRegistrationCode = '';
  let code = '';
  let result:
    | {
        beneficiary: string;
        authorIsBeneficiary: boolean;
        author: { firstName: string; lastName: string };
        paid: boolean;
        id: string;
        ticket: { name: string; group?: { name: string } };
        paymentMethod?: PaymentMethod | undefined;
      }
    | false
    | undefined = undefined;

  function resultChanged(old: typeof result, now: typeof result): boolean {
    if (old === undefined) return now !== undefined;

    if (old === false) return true;

    if (now === undefined || now === false) return true;

    return JSON.stringify(old) !== JSON.stringify(now);
  }

  $: check(code).catch((error) => {
    console.error(error);
  });

  let realTheme = '';
  let closeTimeoutHandle: undefined | NodeJS.Timeout = undefined;
  let aspectRatio = 16 / 9;
  onDestroy(() => {
    $theme = realTheme;
  });

  $: console.log(aspectRatio);

  onMount(() => {
    aspectRatio = window.innerHeight / window.innerWidth;
    realTheme = $theme;
    $theme = 'dark';
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 5,
        aspectRatio,
        // qrbox: { width: 300, height: 300 }
      },
      false
    );
    console.log('initialized qr scanner');
    scanner.render(
      (text) => {
        code = text;
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  });

  async function check(decodedContents: string): Promise<typeof result> {
    if (!decodedContents.startsWith('r:')) return undefined;

    const controllingManualRegistrationCode = manualRegistrationCode === '';
    if (controllingManualRegistrationCode)
      manualRegistrationCode = decodedContents.replace(/^r:/, '');

    const { registration } = await $zeus.query({
      registration: [
        { id: decodedContents },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on QueryRegistrationSuccess': {
            data: {
              beneficiary: true,
              authorIsBeneficiary: true,
              author: { firstName: true, lastName: true, fullName: true },
              paid: true,
              id: true,
              ticket: { name: true, group: { name: true } },
              paymentMethod: true,
            },
          },
        },
      ],
    });

    let r: typeof result = false;

    if (registration.__typename !== 'Error') r = registration.data;

    if (resultChanged(result, r) && r !== undefined) {
      if (r === false || !r?.paid) window.navigator.vibrate([200, 100, 200]);
      else window.navigator.vibrate(100);
    }

    result = r;
    if (controllingManualRegistrationCode) manualRegistrationCode = '';

    if (result === false) {
      if (closeTimeoutHandle) clearTimeout(closeTimeoutHandle);
      closeTimeoutHandle = setTimeout(() => {
        result = undefined;
      }, 5000);
    }
  }
</script>

<section class="qr">
  <div id="reader" />
</section>

<div class="result-card">
  <Card --card-bg="var(--bg)">
    {#if result !== undefined}
      <section class="close">
        <ButtonGhost
          on:click={() => {
            if (closeTimeoutHandle) {
              clearTimeout(closeTimeoutHandle);
              closeTimeoutHandle = undefined;
            }

            result = undefined;
          }}><IconClose /></ButtonGhost
        >
      </section>
    {/if}
    <section class="result">
      {#if result === undefined}
        <p class="idle">Prêt à scanner</p>
      {:else if result === false}
        <div class="icon">
          <div class="circle danger">
            <IconClose />
          </div>
        </div>
        <h2 class="invalid">Billet invalide</h2>
      {:else}
        <div class="header">
          <div class="circle" class:danger={!result.paid} class:success={result.paid}>
            {#if result.paid}
              <IconCheck />
            {:else}
              <IconClose />
            {/if}
          </div>
          <div class="text">
            {#if result.authorIsBeneficiary}
              <h3>{result.author.firstName} {result.author.lastName}</h3>
            {:else}
              <h3>{result.beneficiary}</h3>
              {#if result.paid}
                <p>Achetée par {result.author.firstName} {result.author.lastName}</p>
              {/if}
            {/if}
            {#if result.paid}
              <p>
                Payée par {DISPLAY_PAYMENT_METHODS[result.paymentMethod ?? 'Other']}
              </p>
            {:else}
              <p><strong>Non payée</strong></p>
            {/if}
          </div>
        </div>
        <div class="ticket">
          <span class="label">Billet</span>
          <span class="name">
            {#if result.ticket.group}
              {result.ticket.group.name} <IconChevronRight />
            {/if}
            {result.ticket.name}
          </span>
        </div>
      {/if}
    </section>
    <form
      class="manual"
      on:submit|preventDefault={() => {
        code = 'r:' + manualRegistrationCode.replace(/^r:/, '').trim().toLowerCase();
      }}
    >
      <InputText label="" placeholder="Code de réservation" bind:value={manualRegistrationCode} />
      <ButtonSecondary submits>Vérifier</ButtonSecondary>
    </form>
  </Card>
</div>

<style>
  .result-card {
    --margin: 2.5rem;

    position: fixed;
    right: var(--margin);
    bottom: calc(var(--margin) + 30px);
    left: var(--margin);
  }

  .manual {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .result {
    margin-bottom: 1rem;
    color: var(--text);
  }

  .idle {
    text-align: center;
  }

  .close {
    position: absolute;
    top: 1.5rem;
    right: 0.95rem;
  }

  .ticket {
    display: flex;
    flex-flow: column wrap;
    margin-top: 1rem;
  }

  .ticket .label {
    font-size: 0.9em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .ticket .name {
    margin-top: -0.4em;
    font-size: 1.5rem;
  }

  .icon {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
    font-size: 2rem;
  }

  .header {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
    font-size: 1.5rem;
    color: var(--text);
    background: var(--bg);
    border-radius: 50%;
  }

  h2.invalid {
    margin-bottom: 2rem;
    text-align: center;
  }

  #reader {
    border: none !important;
  }

  /* stylelint-disable selector-id-pattern */
  #reader :global(#reader__scan_region) {
    position: fixed !important;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    background: black;
  }

  /* #reader :global(#reader__dashboard) {
    display: none;
  } */

  /* #reader :global(#html5-qrcode-anchor-scan-type-change),
  #reader :global(#html5-qrcode-button-camera-stop),
  #reader :global(img[alt='Info icon']) {
    display: none !important;
  } */

  #reader :global(#reader__scan_region video) {
    object-fit: cover;
  }
</style>
