<script lang="ts">
  import type { PageData } from './$types';
  import PostDetails from '$lib/components/FormArticle.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  export let data: PageData;

  const { title } = data.article;
</script>

<h1>
  <ButtonBack />

  Édition de l'article {title}
</h1>

<FormPicture objectName="Article" bind:object={data.article} />
<PostDetails bind:data />

<style>
  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>
