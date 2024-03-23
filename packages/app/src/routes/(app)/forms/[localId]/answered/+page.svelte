<script lang="ts">
  import IconCheck from '~icons/mdi/check';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconBack from '~icons/mdi/undo-variant';
  import IconHome from '~icons/mdi/home-outline';
</script>

<div class="content">
  <div class="icon">
    <IconCheck></IconCheck>
  </div>
  <h1>Et voilà!</h1>
  <p>Merci d'avoir répondu au formulaire :)</p>
  <section class="actions">
    <ButtonSecondary icon={IconBack} href="../answer">Modifier mes réponses</ButtonSecondary>
    <ButtonSecondary icon={IconHome} href="/">Retour à l'accueil</ButtonSecondary>
  </section>
</div>

<style>
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-grow: 1;
  }

  .icon {
    font-size: 3rem;
  }

  section.actions {
    margin-top: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em 1em;
  }
</style>
