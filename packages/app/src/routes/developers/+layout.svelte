<script>
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import IconBack from '~icons/mdi/arrow-left';
</script>

<header>
  <nav>
    <ButtonInk href="/" icon={IconBack}>Retour à Churros</ButtonInk>
    <ButtonInk href="/developers/apps">Mes applications</ButtonInk>
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 1rem 2rem;
    background: var(--muted-bg);
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
  }

  .content {
    padding-top: 6rem;
  }

  .logo {
    display: flex;
    gap: 1rem;
    height: 3rem;
    align-items: end;
  }

  .logo p {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
  }
</style>
