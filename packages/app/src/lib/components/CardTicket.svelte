<script lang="ts">
  import Qrcode from '~icons/mdi/qrcode';
  import CashClock from '~icons/mdi/cash-clock';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';

  export let href: string;
  export let ticket: { name: string; event: { pictureFile: string; title: string } };
  export let beneficiary: string;
  export let beneficiaryUser: undefined | { fullName: string } = undefined;
  export let authorIsBeneficiary: boolean;
  export let author: { fullName: string };
  export let paid: boolean;
</script>

<a
  class="billet"
  {href}
  class:noimg={!ticket.event.pictureFile}
  style:background-image={ticket.event.pictureFile
    ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0,0,0,0.5)), url('${PUBLIC_STORAGE_URL}${ticket.event.pictureFile}')`
    : undefined}
  style:--text={ticket.event.pictureFile ? 'white' : 'var(--text)'}
>
  <div class="overlay-text">
    {#if !authorIsBeneficiary}
      <div class="beneficiary">
        {#if beneficiary}
          Pour {beneficiaryUser?.fullName ?? beneficiary}
        {:else}
          Par {author.fullName}
        {/if}
      </div>
    {/if}
    <div class="title">{ticket.event.title}</div>
    <div class="ticket-name">{ticket.name}</div>
  </div>
  <div class="qrcode" class:paid>
    {#if paid}
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
    background-size: cover;
    border-radius: var(--radius-block);
  }

  .billet:hover, .billet

  .billet.noimg {
    border: var(--border-block) solid var(--border);
  }

  .overlay-text {
    box-sizing: border-box;
    color: var(--text);
    text-align: left;
  }

  .qrcode {
    right: 0;
    box-sizing: border-box;
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
  }

  .ticket-name {
    font-size: 1rem;
  }
</style>
