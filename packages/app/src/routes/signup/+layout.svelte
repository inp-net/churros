<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import { route } from '$lib/ROUTES';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ LayoutSignup } = data);
</script>

<MaybeError result={$LayoutSignup} let:data={{ me }}>
  {#if me}
    <div class="logged-in">
      <Alert theme="warning">
        Tu es déjà connecté.e en tant que @{me.uid}
        <ButtonSecondary href={route('/')}>Retour à l'accueil</ButtonSecondary>
      </Alert>
    </div>
  {/if}
  <div class="contents">
    <slot />
  </div>
</MaybeError>

<style>
  .logged-in {
    margin-bottom: 2rem;
  }

  .contents {
    padding-bottom: 3rem;
  }
</style>
