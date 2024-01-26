<script lang="ts">
  import Qrcode from '~icons/mdi/qrcode';
  import IconCancelled from '~icons/mdi/cancel';
  import CashClock from '~icons/mdi/cash-clock';
  import { env } from '$env/dynamic/public';

  export let href: string;
  export let ticket: { name: string; event: { pictureFile: string; title: string } };
  export let beneficiary: string;
  export let beneficiaryUser: undefined | null | { fullName: string } = undefined;
  export let authorIsBeneficiary: boolean;
  export let author: undefined | null | { fullName: string } = undefined;
  export let authorEmail: string;
  export let paid: boolean;
  export let cancelled: boolean;

  export let floating = false;
</script>

<a
  class="billet"
  class:floating
  {href}
  class:danger={cancelled}
  class:noimg={!ticket.event.pictureFile}
  style:background-image={ticket.event.pictureFile
    ? `linear-gradient(rgba(0, 0, 0, var(--alpha)), rgba(0,0,0,var(--alpha))), url('${env.PUBLIC_STORAGE_URL}${ticket.event.pictureFile}')`
    : undefined}
  style:--text={ticket.event.pictureFile ? 'white' : 'var(--text)'}
>
  <div class="overlay-text">
    {#if !authorIsBeneficiary}
      <div class="beneficiary">
        {#if beneficiary}
          Pour {beneficiaryUser?.fullName ?? beneficiary}
        {:else}
          Par {author?.fullName ?? authorEmail}
        {/if}
      </div>
    {/if}
    <div class="title">{ticket.event.title}</div>
    <div class="ticket-name">
      {#if cancelled}
        <em>Place annulée</em>
      {:else}
        {ticket.name}
      {/if}
    </div>
  </div>
  <div class="qrcode" class:paid>
    {#if cancelled}
      <IconCancelled />
    {:else if paid}
      <Qrcode />
    {:else}
      <CashClock />
    {/if}
  </div>
</a>

<style lang="scss">
  .billet {
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background-color: var(--bg);
    background-size: cover;
    border-radius: var(--radius-block);
    transition: all 0.5s ease;

    --alpha: 0.5;
  }

  .billet.floating {
    box-shadow: var(--shadow-big);
  }

  .billet.noimg:not(.floating) {
    border: var(--border-block) solid var(--border);
  }

  .billet.noimg:hover,
  .billet.noimg:focus-visible {
    --text: var(--hover-text);

    background-color: var(--hover-bg);
    border-color: var(--hover-border);
  }

  .billet:not(.noimg):hover,
  .billet:not(.noimg):focus-visible {
    --alpha: 0.6;
  }

  .overlay-text {
    box-sizing: border-box;
    color: var(--text);
    text-align: left;
  }

  .qrcode {
    right: 0;
    box-sizing: border-box;
    flex-shrink: 0;
    font-size: 2rem;
    color: var(--text);
    text-align: right;
  }

  .beneficiary {
    font-size: 0.8rem;
  }

  .title {
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 1.1;
  }

  .ticket-name {
    font-size: 1rem;
  }
</style>
