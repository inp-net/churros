<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { graphql, type BookingScanResult } from '$houdini';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { onceLoaded } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import { differenceInMilliseconds } from 'date-fns';
  import QRScanner from 'qr-scanner';
  import { onDestroy } from 'svelte';
  import type { PageData } from './$houdini';
  import ScanResult from './ScanResult.svelte';

  export let data: PageData;
  $: ({ PageEventScanBookings } = data);

  $: eventTitle = onceLoaded($PageEventScanBookings.data?.event.title, (t) => t || '', '');

  $: if (browser && eventTitle) {
    window.dispatchEvent(
      new CustomEvent('NAVTOP_UPDATE_TITLE', {
        detail: `Scanner pour ${eventTitle}`,
      }),
    );
  }

  const SCAN_COOLDOWN_MS = 800;
  const lastScanTimestamp = 0;
  let result: BookingScanResult;
  let previousDecodedContents = '';
  let videoElement: HTMLVideoElement;

  function onScanResult({ data }: QRScanner.ScanResult) {
    if (result && differenceInMilliseconds(new Date(), lastScanTimestamp) < SCAN_COOLDOWN_MS) 
      return;
    

    if (data === previousDecodedContents) 
      return;
    

    previousDecodedContents = data;

    graphql(`
      mutation VerifyBooking($decodedContent: String!, $urlTemplate: URL!, $event: LocalID!) {
        verifyBooking(bookingURLTemplate: $urlTemplate, event: $event, qrcode: $decodedContent) {
          ... on MutationVerifyBookingSuccess {
            data {
              ...BookingScanResult
            }
          }
          ...MutationErrors
        }
      }
    `)
      .mutate({
        decodedContent: data,
        urlTemplate: new URL(route('/bookings/[code]', '[code]'), $page.url),
        event: $page.params.id,
      })
      .then((response) => {
        if (toasts.mutation(response, 'verifyBooking', '', 'Impossible de scanner ce QR code')) 
          result = response.data.verifyBooking.data;
        
      });
  }

  let scanner: QRScanner | undefined;
  $: if (videoElement) {
    scanner = new QRScanner(videoElement, onScanResult, {
      highlightScanRegion: true,
      highlightCodeOutline: true,
      calculateScanRegion(video) {
        const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
        const scanRegionSize = Math.round((2 / 3) * smallestDimension);
        return {
          x: Math.round((video.videoWidth - scanRegionSize) / 2),
          y: Math.round((video.videoHeight - scanRegionSize) / 2) - 250,
          width: scanRegionSize,
          height: scanRegionSize,
        };
      },
    });
  }

  $: if (scanner && browser && videoElement && $PageEventScanBookings.data?.event) 
    scanner.start();
  

  onDestroy(() => {
    scanner?.stop();
  });
</script>

<MaybeError result={$PageEventScanBookings}>
  <div class="camera-area">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoElement} />
  </div>

  <section class="results">
    <ScanResult {result} />
  </section>
</MaybeError>

<style>
  :global([data-route='/(app)/events/[id]/scan'] #scrollable-area),
  :global([data-route='/(app)/events/[id]/scan'] .page-content) {
    overflow: hidden;
  }

  :global([data-route='/(app)/events/[id]/scan'] .nav-bottom) {
    position: fixed !important;
    right: 0;
    bottom: 0;
    left: 0;
  }

  :global([data-route='/(app)/events/[id]/scan']) {
    --nav-bottom-background: transparent;
    --nav-top-background: transparent;
  }

  :global([data-route='/(app)/events/[id]/scan'] #scrollable-area) {
    position: fixed;
    inset: 0;
    padding: 0 !important;
  }

  .camera-area {
    position: relative;
    width: max-content;
    height: 100%;
    overflow: hidden;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  video :global(+ .scan-region-highlight) {
    border-radius: 30px;
    outline: color-mix(in srgb, 85% var(--bg), transparent) solid 100vmax;
  }

  :global(.scan-region-highlight-svg) {
    display: none;
  }

  video :global(+ .code-outline-highlight) {
    stroke: rgb(255 255 255 / 50%) !important;
    stroke-dasharray: none !important;
    stroke-width: 15 !important;
  }

  .results {
    position: fixed;
    top: calc(50% + 50px);
    left: 50%;
    width: calc(100vw - 2 * 2rem);
    padding: 1rem;
    background: var(--bg);
    border-radius: var(--radius-block);
    translate: -50% 0;
  }
</style>
