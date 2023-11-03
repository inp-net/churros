<script lang="ts">
  import type { PageData } from './$types';
  import FormArticle from '$lib/components/FormArticle.svelte';

  export let data: PageData;
</script>

<div class="content">
  <h2>Nouveau post</h2>
  <FormArticle bind:data />
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  h2 {
    text-align: center;
  }
</style>
