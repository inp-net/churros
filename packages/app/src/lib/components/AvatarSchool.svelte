<script lang="ts">
  export let name: string;
  export let pictureURL: string;
  // export let color: string | undefined = undefined;
  export let href = '#';
</script>

<a class="avatar-school" {href}>
  <img src={pictureURL} alt={name} />
  {name}
</a>

<style>
  a {
    display: inline-flex;
    gap: 0.5em;
  }

  img {
    width: 1.2em;
    height: 1.2em;
    object-fit: cover;
    border-radius: var(--radius-inline);
  }
</style>
