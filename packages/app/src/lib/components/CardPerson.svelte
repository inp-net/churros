<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { fragment, graphql, type CardPersonUser } from '$houdini';
  import IconAccount from '~icons/mdi/account';

  export let user: CardPersonUser;
  $: User = fragment(
    user,
    graphql`
      fragment CardPersonUser on User {
        uid
        fullName
        pictureFile
      }
    `,
  );

  $: ({ fullName, pictureFile, uid } = $User);

  export let href = '';
</script>

<a href={href || `/users/${uid}`} class="person" draggable="false" on:click>
  <div class="img">
    {#if pictureFile}
      <img src={`${env.PUBLIC_STORAGE_URL}${pictureFile}`} alt={fullName} draggable="false" />
    {:else}
      <IconAccount />
    {/if}
  </div>
  <p class="name">{fullName}</p>
</a>

<style>
  .person {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: fit-content;
    padding: 0.5em;
    text-decoration: none; /* Safari */ /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }

  .person .img {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 6em;
    height: 6em;
    overflow: hidden;
    font-weight: bold;
    line-height: 6em; /* to vertically center alt text */
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
    border-radius: 50%;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease 0.1s;
  }

  .person:hover .img,
  .person:focus-visible .img {
    box-shadow: var(--shadow);
    transform: translateY(-0.25em);
  }

  .person .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .name {
    margin: 0;
    font-size: 1em;
    font-weight: 600;
  }
</style>
