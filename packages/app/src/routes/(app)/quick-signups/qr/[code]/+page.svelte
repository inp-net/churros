<script lang="ts">
  import type { PageData } from './$types';
  import LogoChurros from '$lib/components/LogoChurros.svelte';

  export let data: PageData;
</script>

<div class="content">
  <main class="qrcode-box">
    <svg class="qrcode" viewBox={data.viewbox} stroke="#000" stroke-width="1.05">
      <path d={data.path} fill="black" />
    </svg>
    <p class="link">{data.link.replace(new URL(data.link).protocol + '//', '')}</p>
  </main>

  <footer>
    <LogoChurros wordmark />
  </footer>
</div>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
    justify-content: center;
  }

  .qrcode {
    max-height: 70vh;
  }

  p.link {
    font-size: 3rem;
  }

  footer {
    display: flex;
    justify-content: center;
    height: 4rem;
    margin-top: 2rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
</style>
