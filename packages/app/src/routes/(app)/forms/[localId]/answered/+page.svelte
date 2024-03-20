<script lang="ts">
  import IconCheck from '~icons/mdi/check';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
</script>

<div class="content">
  <div class="icon">
    <IconCheck></IconCheck>
  </div>
  <h1>Et voilà!</h1>
  <p>Merci d'avoir répondu au formulaire :)</p>
  <section class="actions">
      <ButtonSecondary href="/">Retour à l'accueil</ButtonSecondary>
  </section>
</div>

<style>
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
  }

  .icon {
    font-size: 3rem;
  }

  section.actions {
    margin-top: 2rem;
  }
</style>
