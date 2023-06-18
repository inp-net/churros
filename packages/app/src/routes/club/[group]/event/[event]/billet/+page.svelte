<script lang="ts">
  import IconChevronRight from '~icons/mdi/chevron-right';
  import { dateTimeFormatter } from '$lib/dates';
  import * as qrcode from 'qr-code-generator-lib';
  import type { PageData } from './$types';
  import BackButton from '$lib/components/buttons/BackButton.svelte';

  export let data: PageData;

  let { beneficiary, authorIsBeneficiary, author, ticket, id } = data.registrationOfUser;

  let qrcodeDimension: number;
  let qrcodePath: string;
  $: ({ d: qrcodePath, dim: qrcodeDimension } = qrcode.renderPath(qrcode.getMatrix(id)));
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

<svg viewBox="0 0 {qrcodeDimension} {qrcodeDimension}" stroke="#000" stroke-width="1.05">
  <path d={qrcodePath} fill="black" />
</svg>
