<script>
  import IconMail from '~icons/mdi/email';
  import { PUBLIC_CONTACT_EMAIL } from '$env/static/public';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
</script>

<div class="content">
  <h1>Proposer un service</h1>

  <ButtonSecondary
    icon={IconMail}
    href="mailto:{PUBLIC_CONTACT_EMAIL}?{new URLSearchParams({
      subject: "Proposition de service pour l'AEppli",
    }).toString()}">Envoyer un mail</ButtonSecondary
  >
</div>

<!-- TODO store in a form in the db -->
<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>
