<script lang="ts">
  import IconChevronRight from '~icons/mdi/chevron-right';
  import IconClose from '~icons/mdi/close';
  import IconGear from '~icons/mdi/gear-outline';
  import IconGearCancel from '~icons/mdi/cog-off-outline';
  import IconOpposed from '~icons/mdi/hand-back-right-off-outline';
  import IconCheck from '~icons/mdi/check';
  import IconRepeatOff from '~icons/mdi/repeat-off';
  import IconOtherEvent from '~icons/mdi/circle-off-outline';
  import IconNotPaid from '~icons/mdi/credit-card-off-outline';
  import { type PaymentMethod, zeus, RegistrationVerificationState } from '$lib/zeus';
  import { type SvelteComponent, onDestroy, onMount } from 'svelte';
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { DISPLAY_PAYMENT_METHODS, PAYMENT_METHODS_ICONS } from '$lib/display';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Card from '$lib/components/Card.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { browser } from '$app/environment';
  import type { QrBounds } from 'html5-qrcode/esm/core';
  import { page } from '$app/stores';
  import { formatDateTime } from '$lib/dates';
  import { format, isToday } from 'date-fns';
  import { toasts } from '$lib/toasts';

  const SCAN_COOLDOWN = 300; /* ms */ // TODO increase to 800 ?
  let lastScanTimestamp = 0;
  let previousDecodedContents: undefined | string = undefined;

  const VIBRATION_PATTERNS: Record<RegistrationVerificationState, number[]> = {
    [RegistrationVerificationState.Ok]: [100],
    [RegistrationVerificationState.AlreadyVerified]: [50, 25, 50, 25, 50, 25, 50],
    [RegistrationVerificationState.NotFound]: [400],
    [RegistrationVerificationState.NotPaid]: [200, 100, 200],
    [RegistrationVerificationState.Opposed]: [300, 50, 300, 50, 300],
    [RegistrationVerificationState.OtherEvent]: [50, 50, 50, 50],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const STATE_TO_ICON: Record<RegistrationVerificationState, typeof SvelteComponent<any>> = {
    [RegistrationVerificationState.Ok]: IconCheck,
    [RegistrationVerificationState.AlreadyVerified]: IconRepeatOff,
    [RegistrationVerificationState.NotFound]: IconClose,
    [RegistrationVerificationState.NotPaid]: IconNotPaid,
    [RegistrationVerificationState.Opposed]: IconOpposed,
    [RegistrationVerificationState.OtherEvent]: IconOtherEvent,
  };

  let manualRegistrationCode = '';
  let code = '';
  let boundingBox: QrBounds | undefined;
  let errorWhileVerifying = '';
  let result:
    | {
        state: RegistrationVerificationState;
        registration?: {
          beneficiary: string;
          authorIsBeneficiary: boolean;
          author?: undefined | { firstName: string; lastName: string };
          authorEmail: string;
          paid: boolean;
          opposed: boolean;
          opposedAt?: Date | null | undefined;
          opposedBy?:
            | {
                fullName: string;
                uid: string;
                pictureFile: string;
              }
            | undefined;
          id: string;
          ticket: {
            id: string;
            name: string;
            group?: { name: string };
            event: { uid: string; title: string; group: { uid: string } };
          };
          paymentMethod?: PaymentMethod | undefined;
          verifiedAt?: Date | null | undefined;
          verifiedBy?:
            | undefined
            | {
                uid: string;
                fullName: string;
                pictureFile: string;
              };
        };
      }
    | undefined;

  let closeTimeoutHandle: ReturnType<typeof setTimeout> | undefined = undefined;
  let showCameraSettings = true;
  let aspectRatio = 16 / 9;
  let scanner: Html5QrcodeScanner | undefined;
  let enteringManualCode = false;

  onMount(() => {
    aspectRatio = window.innerHeight / window.innerWidth;
    scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 5,
        aspectRatio,
        // videoConstraints: {
        //   facingMode: {
        //     exact: 'environment',
        //   },
        // },
        // qrbox: { width: 300, height: 300 }
      },
      false,
    );
    scanner.render(
      async (text, { result: { bounds } }) => {
        boundingBox = bounds;
        showCameraSettings = false;
        if (!result || (code !== text && !enteringManualCode)) {
          code = text;
          if (code === previousDecodedContents && Date.now() - lastScanTimestamp < SCAN_COOLDOWN)
            return;

          previousDecodedContents = code;
          lastScanTimestamp = Date.now();
          await check(code).catch((error) => {
            toasts.error(`Impossible de vérifier la réservation ${code}`, error.message);
          });
          manualRegistrationCode = code.replace(/^r:/, '').toUpperCase();
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  });

  onDestroy(async () => {
    await scanner?.clear();
  });

  $: if (browser) {
    const dashboard: HTMLDivElement | null = document.querySelector('#reader__dashboard');
    if (dashboard) dashboard.style.display = showCameraSettings ? 'block' : 'none';
  }

  async function check(decodedContents: string): Promise<typeof result> {
    if (!decodedContents.startsWith('r:')) return undefined;

    const { verifyBooking: verifyRegistration } = await $zeus.mutate({
      verifyBooking: [
        { id: decodedContents, event: $page.params.id },
        {
          '__typename': true,
          '...on Error': {
            message: true,
          },
          '...on MutationVerifyBookingSuccess': {
            data: {
              state: true,
              registration: {
                beneficiary: true,
                authorIsBeneficiary: true,
                authorEmail: true,
                author: { firstName: true, lastName: true, fullName: true },
                paid: true,
                opposed: true,
                opposedAt: true,
                opposedBy: {
                  fullName: true,
                  uid: true,
                  pictureFile: true,
                },
                id: true,
                ticket: {
                  id: true,
                  name: true,
                  group: { name: true },
                  event: { uid: true, title: true, group: { uid: true } },
                },
                paymentMethod: true,
                verifiedAt: true,
                verifiedBy: {
                  fullName: true,
                  uid: true,
                  pictureFile: true,
                },
              },
            },
          },
        },
      ],
    });

    let r: typeof result = {
      state: RegistrationVerificationState.NotFound,
    };

    if (verifyRegistration.__typename === 'Error') {
      errorWhileVerifying = verifyRegistration.message;
    } else {
      errorWhileVerifying = '';
      r = verifyRegistration.data;
    }

    if (window.navigator.vibrate) {
      window.navigator.vibrate(
        VIBRATION_PATTERNS[r?.state ?? RegistrationVerificationState.NotFound],
      );
    }

    result = r;
    // if (controllingManualRegistrationCode) manualRegistrationCode = '';

    if (result?.state === RegistrationVerificationState.NotFound) {
      if (closeTimeoutHandle) clearTimeout(closeTimeoutHandle);
      closeTimeoutHandle = setTimeout(() => {
        result = undefined;
        manualRegistrationCode = '';
      }, 5000);
    }
  }
</script>

<section class="qr">
  {#if boundingBox}
    <div
      class="bouding-box"
      style:width={boundingBox.width}
      style:height={boundingBox.height}
      style:left={boundingBox.x}
      style:top={boundingBox.y}
    />
  {/if}
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
            manualRegistrationCode = '';
          }}><IconClose /></ButtonGhost
        >
      </section>
    {/if}
    <section class="result">
      {#if errorWhileVerifying !== ''}
        <div class="icon">
          <div class="circle danger">
            <svelte:component this={STATE_TO_ICON[RegistrationVerificationState.NotFound]} />
          </div>
        </div>
        <h2 class="invalid">Impossible de scanner cet évènement</h2>
        <p class="typo-details">Assure-toi d'être manager de l'évènement</p>
      {:else if result === undefined}
        <p class="idle">Prêt à scanner</p>
      {:else if result.state === RegistrationVerificationState.NotFound}
        <div class="icon">
          <div class="circle danger">
            <svelte:component this={STATE_TO_ICON[result.state]} />
          </div>
        </div>
        <h2 class="invalid">Billet invalide</h2>
      {:else if result.registration}
        {@const { authorIsBeneficiary, author, authorEmail, beneficiary, paymentMethod, ticket } =
          result.registration}
        {@const ok = result.state === RegistrationVerificationState.Ok}
        <div class="header">
          <div class="circle" class:danger={!ok} class:success={ok}>
            <svelte:component this={STATE_TO_ICON[result.state]} />
          </div>
          <div class="text">
            {#if authorIsBeneficiary}
              <h3>
                {#if author}
                  {author.firstName} {author.lastName}
                {:else}
                  {authorEmail}
                {/if}
              </h3>
            {:else}
              <h3>{beneficiary}</h3>
              {#if ok}
                <p>
                  Achetée par {#if author}{author.firstName}
                    {author.lastName}{:else}{authorEmail}{/if}
                </p>
              {/if}
            {/if}
            {#if ok}
              <p>
                Payée via <svelte:component
                  this={PAYMENT_METHODS_ICONS[paymentMethod ?? 'Other']}
                />
                {DISPLAY_PAYMENT_METHODS[paymentMethod ?? 'Other']}
              </p>
            {:else if result.state === RegistrationVerificationState.Opposed}
              <p>
                <strong>En opposition</strong>
              </p>
              {#if result.registration?.opposedAt && result.registration?.opposedBy}
                {@const { opposedAt, opposedBy } = result.registration}
                <p class="typo-details details">
                  Opposée par <a href="/users/{opposedBy.uid}">{opposedBy.fullName}</a>
                  {#if isToday(opposedAt)}à {format(opposedAt, 'HH:mm')}{:else}le {formatDateTime(
                      opposedAt,
                    )}{/if}
                </p>
              {/if}
            {:else if result.state === RegistrationVerificationState.NotPaid}
              <p><strong>Non payée</strong></p>
            {:else if result.state === RegistrationVerificationState.OtherEvent}
              <p><strong>Mauvais évènement</strong></p>
              <p class="typo-details details">
                Cette réservation est pour l'évènement <a
                  href="/events/{result.registration.ticket.event.group.uid}/{result.registration
                    .ticket.event.uid}">{result.registration.ticket.event.title}</a
                >
              </p>
            {:else if result.state === RegistrationVerificationState.AlreadyVerified}
              <p>
                <strong>Déjà vérifiée</strong>
              </p>
              {#if result.registration?.verifiedAt && result.registration?.verifiedBy}
                {@const { verifiedAt, verifiedBy } = result.registration}
                <p class="typo-details details">
                  par <a href="/users/{verifiedBy.uid}">{verifiedBy.fullName}</a>
                  {#if isToday(verifiedAt)}à {format(verifiedAt, 'HH:mm')}{:else}le {formatDateTime(
                      verifiedAt,
                    )}{/if}
                </p>
              {/if}
            {/if}
          </div>
        </div>
        <div class="ticket-and-action">
          <div class="ticket">
            <span class="label">Billet</span>
            <span class="name">
              {#if ticket.group}
                {ticket.group.name} <IconChevronRight />
              {/if}
              {ticket.name}
            </span>
          </div>
          {#if result?.registration && result.state === RegistrationVerificationState.NotPaid}
            <div class="action">
              <ButtonSecondary
                icon={IconCheck}
                on:click={async () => {
                  const registration = result?.registration;
                  if (!registration) return;
                  await $zeus.mutate({
                    upsertRegistration: [
                      {
                        id: result?.registration?.id,
                        ticketId: registration.ticket.id,
                        paid: true,
                        beneficiary: result?.registration?.beneficiary,
                        paymentMethod: result?.registration?.paymentMethod,
                      },
                      {
                        '...on Error': {
                          message: true,
                        },
                        '...on MutationUpsertRegistrationSuccess': {
                          data: {
                            paid: true,
                          },
                        },
                      },
                    ],
                  });
                  await check(registration.id);
                }}>Payée</ButtonSecondary
              >
            </div>
          {/if}
        </div>
      {/if}
    </section>
    <form
      class="manual"
      on:submit|preventDefault={async () => {
        code = 'r:' + manualRegistrationCode.replace(/^r:/, '').trim().toLowerCase();
        await check(code);
      }}
    >
      <section class="camera-settings-toggle" class:shown={showCameraSettings}>
        <ButtonGhost
          help={(showCameraSettings ? 'Cacher' : 'Afficher') + ' les paramètres caméra'}
          on:click={() => {
            showCameraSettings = !showCameraSettings;
          }}
          >{#if showCameraSettings}
            <IconGearCancel />
          {:else}
            <IconGear />
          {/if}</ButtonGhost
        >
      </section>
      <InputText
        on:focus={() => {
          enteringManualCode = true;
        }}
        on:blur={() => {
          enteringManualCode = false;
        }}
        label=""
        placeholder="Code de réservation"
        bind:value={manualRegistrationCode}
      />
      <ButtonSecondary submits>Vérifier</ButtonSecondary>
    </form>
  </Card>
</div>

<style lang="scss">
  .result-card {
    --margin: 2.5rem;

    position: fixed;
    right: var(--margin);
    bottom: calc(var(--margin) + 30px);
    left: var(--margin);
  }

  .camera-settings-toggle {
    // position: fixed;
    // left: 2.25rem;
    // top: 155px;
    font-size: 1.2rem;
  }

  .manual {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
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

  .ticket-and-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  .result .details {
    font-weight: normal;
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
    flex-shrink: 0;
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

  // .bounding-box {
  //   border: calc(var(--border-block) * 2) solid var(--success-border);
  //   border-radius: var(--radius-block);
  // }

  #reader {
    border: none !important;
  }

  /* stylelint-disable selector-id-pattern */
  #reader :global(#reader__scan_region) {
    position: fixed !important;
    inset: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    background: black;
  }

  #reader :global(img[alt='Info icon']),
  #reader :global(#html5-qrcode-anchor-scan-type-change) {
    display: none !important;
  }

  #reader :global(#reader__dashboard_section_csr > span:nth-child(2)) {
    font-size: 0;
  }

  #reader :global(#reader__dashboard_section) {
    padding: 0 !important;
  }

  #reader :global(#reader__dashboard) {
    position: fixed;
    top: 150px;
    left: 2rem;
    width: calc(100% - 4rem) !important;
    padding: 1rem;
    color: var(--text);
    background-color: var(--bg);
    border-radius: var(--radius-block);
  }

  #reader :global(#reader__dashboard button),
  #reader :global(#reader__dashboard select) {
    padding: 0.25rem 0.5rem;
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: 100000px;
  }

  /* #reader :global(#html5-qrcode-anchor-scan-type-change),
  #reader :global(#html5-qrcode-button-camera-stop),
  #reader :global(img[alt='Info icon']) {
    display: none !important;
  } */

  #reader :global(#reader__scan_region video) {
    object-fit: cover;
  }
</style>
