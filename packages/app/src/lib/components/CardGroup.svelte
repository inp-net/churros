<script lang="ts">
  import { fragment, graphql, type CardGroupGroup } from '$houdini';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';

  export let group: CardGroupGroup;
  $: Group = fragment(
    group,
    graphql`
      fragment CardGroupGroup on Group {
        uid
        name
        pictureFile
        pictureFileDark
        studentAssociation {
          school {
            name
          }
        }
      }
    `,
  );

  $: ({ uid, name, pictureFile, pictureFileDark, studentAssociation } = $Group);
  export let role = '';
  export let href = '';
  export let showSchool = false;
</script>

<a href={href || `/groups/${uid}`} title={name} class="group" draggable="false" on:click>
  <div class="img">
    <img
      src={groupLogoSrc($isDark, { pictureFile, pictureFileDark })}
      alt={name}
      draggable="false"
    />
  </div>
  <p class="name">{name}</p>
  {#if role}
    <p class="role">{role}</p>
  {/if}
  {#if studentAssociation && showSchool}
    <p class="school">{studentAssociation.school.name}</p>
  {/if}
</a>

<style>
  .group {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: fit-content;
    width: 7em;
    padding: 0.5em;
    text-decoration: none; /* Safari */ /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }

  .group .img {
    width: 6em;
    height: 6em;
    overflow: hidden;
    font-weight: bold;
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
    border-radius: var(--radius-block);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease 0.1s;

    &::before {
      /* only target text to avoid small gaps in top of images */
      line-height: 6em; /* to vertically center alt text */
    }
  }

  .group:hover .img,
  .group:focus-visible .img {
    box-shadow: var(--shadow);
    transform: translateY(-0.25em);
  }

  .group .img img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .name {
    max-width: 100%;
    margin: 0.25em 0 0;
    overflow: hidden;
    font-size: 1em;
    font-weight: 600;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .role {
    font-size: 0.8em;
    text-align: center;
  }

  .school {
    font-size: 0.7em;
    color: var(--muted-text);
    text-align: center;
  }
</style>
