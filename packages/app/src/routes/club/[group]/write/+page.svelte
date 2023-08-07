<script lang="ts">
  import type { PageData } from './$types';
  import PostDetails from '$lib/components/FormArticle.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  export let data: PageData;
</script>

<div class="content">
  <h1><ButtonBack /> Écrire un article en tant que {data.article.group.name}</h1>
  <PostDetails bind:data />
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    align-items: center;
    text-align: center;
  }
</style>
