<script>
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import IconBack from '~icons/mdi/arrow-left';
  import IconDocs from '~icons/mdi/book-open-page-variant';
  import IconApps from '~icons/mdi/apps';
</script>

<header>
  <nav>
    <ButtonInk href="/" icon={IconBack}>Retour à Churros</ButtonInk>
    <ButtonInk href="/developers/apps" icon={IconApps}>Mes applications</ButtonInk>
    <ButtonInk href="https://api-docs.churros.inpt.fr" target="_blank" icon={IconDocs}
      >Documentation</ButtonInk
    >
  </nav>
  <div class="logo">
    <LogoChurros wordmark></LogoChurros>
    <p>Developers</p>
  </div>
</header>

<div class="content">
  <slot />
</div>

<style>
  header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: var(--muted-bg);
  }

  .content {
    padding-top: 6rem;
  }

  .logo {
    display: flex;
    gap: 1rem;
    align-items: end;
    height: 3rem;
  }

  .logo p {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
  }
</style>
