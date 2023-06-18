<script lang="ts">
  import IconChevronRight from '~icons/mdi/chevron-right';
  import { dateTimeFormatter } from '$lib/dates';
  import * as qrcode from 'qr-code-generator-lib';
  import type { PageData } from './$types';
  import BackButton from '$lib/components/buttons/BackButton.svelte';
  import { onMount } from 'svelte';
  import { theme } from '$lib/theme';
  import { beforeNavigate, goto } from '$app/navigation';
  import Button from '$lib/components/buttons/Button.svelte';
  import IconCancel from '~icons/mdi/cancel';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import { zeus } from '$lib/zeus';

  let actualTheme: string;

  let confirmingCancellation = false;

  // For this page only, force light theme
  onMount(() => {
    actualTheme = $theme;
    $theme = 'light';
  });
  beforeNavigate(() => {
    $theme = actualTheme;
  });

  export let data: PageData;

  let { beneficiary, authorIsBeneficiary, paid, author, ticket, id } = data.registrationOfUser;

  let qrcodeViewbox: string;
  let qrcodeDim: number;
  let qrcodeElement: SVGElement;
  let qrcodePath: string;
  $: ({ d: qrcodePath, dim: qrcodeDim } = qrcode.renderPath(qrcode.getMatrix(id)));
  $: qrcodeClientRect = qrcodeElement?.querySelector('path')?.getBoundingClientRect();
  let qrcodeBuiltinPadding = 4;
  $: qrcodeViewbox = `${qrcodeBuiltinPadding} ${qrcodeBuiltinPadding} ${
    qrcodeDim - 2 * qrcodeBuiltinPadding
  } ${qrcodeDim - 2 * qrcodeBuiltinPadding}`;
</script>

<h1>
  <BackButton />
  Ma place
</h1>
<h2>
  {#if authorIsBeneficiary}
    {author.firstName} {author.lastName}
  {:else}
    {beneficiary}
  {/if}
</h2>
{#if !authorIsBeneficiary}
  <p>Achetée par {author.firstName} {author.lastName}</p>
{/if}

<h2>Billet</h2>
<p>
  {#if ticket.group}
    {ticket.group.name} <IconChevronRight />
  {/if}
  {ticket.name}
</p>

<h2>Évènement</h2>
<p>
  «{ticket.event.title}» {#if ticket.event.startsAt}du {dateTimeFormatter.format(
      new Date(ticket.event.startsAt)
    )}{/if}
</p>

{#if paid}
  <Alert theme="success">Place payée</Alert>
{:else}
  <Alert theme="danger">Place non payée</Alert>
{/if}

<svg bind:this={qrcodeElement} viewBox={qrcodeViewbox} stroke="#000" stroke-width="1.05">
  <path d={qrcodePath} fill="black" />
</svg>

<p class="registration-code">
  {id.split(':', 2)[1].toUpperCase()}
</p>

<section class="cancel">
  {#if !confirmingCancellation}
    <Button
      on:click={() => {
        confirmingCancellation = true;
      }}><IconCancel /> Libérer ma place</Button
    >
  {:else}
    <Alert theme="danger">
      <h2>Es-tu sûr·e ?</h2>
      <p>
        Il n'est pas possible de revenir en arrière. Tu devras de nouveau prendre une place (s'il en
        reste) si tu veux de nouveau en réserver une.
      </p>
      <Button
        on:click={async () => {
          await $zeus.mutate({
            deleteRegistration: [{ id }, true]
          });
          await goto('..');
        }}>Oui, je confirme</Button
      >
    </Alert>
  {/if}
</section>

<style>
  .registration-code {
    margin-top: -1rem;
    font-weight: bold;
    font-size: 2rem;
    font-family: monospace;
    text-align: center;
  }

  section.cancel {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
