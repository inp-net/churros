<script lang="ts">
  import Qrcode from '~icons/mdi/qrcode';
  import CashClock from '~icons/mdi/cash-clock';

  export let title: string;
  export let href: string;
  export let ticket: { name: string; event: { pictureFile: string } };
  export let beneficiary: string;
  export let beneficiaryUser: { fullName: string };
  export let userIsBeneficiary: boolean;
  export let author: { fullName: string };
  export let paid: boolean;
</script>

<a class="billet" {href} class:noimg={!ticket.event.pictureFile}>
  {#if ticket.event.pictureFile}
    <img loading="lazy" src={ticket.event.pictureFile} alt={'Image du billet'} />
  {/if}
  <div class="overlay-text">
    <div class="beneficiary">
      {#if userIsBeneficiary}
        Par {author.fullName}
      {:else}
        Pour {beneficiaryUser?.fullName ?? beneficiary}
      {/if}
    </div>
    <div class="title">{title}</div>
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
    position: relative;
    display: flex;
    width: 30rem;
    height: 10rem;
    align-items: center;
  }

  .billet.noimg {
    border: var(--border-block) solid var(--border);
    border-radius: 1rem;
  }

  .billet img {
    position: absolute;
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 1rem;
  }

  .overlay-text {
    position: absolute;
    text-align: left;
    color: var(--text);
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
  }

  .qrcode {
    position: absolute;
    color: var(--text);
    box-sizing: border-box;
    padding: 2rem;
    text-align: right;
    right: 0;
  }

  .qrcode > :global(.icon) {
    width: 3em;
    height: 3em;
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
