<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import { isDark } from '$lib/theme';
</script>

<div class="content">
  <h1>Crédits</h1>
  <section class="devs">
    <h2>Développeur·euse·s</h2>
    <div class="cf">
      <p>Cf.</p>
      <AvatarPerson
        href="/groups/devs"
        pictureFile={$isDark ? '/groups/dark/devs.png' : '/groups/devs.png'}
        fullName="Devs"
        inline
        small
      ></AvatarPerson>
    </div>
  </section>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .cf {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
