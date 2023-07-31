<script lang="ts">
  export let checked: boolean;
</script>

<label class="switch">
  <input type="checkbox" bind:checked />
  <span class="slider" />
</label>

<style>
  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 4em;
    height: 1em;
  }

  /* Hide default HTML checkbox */
  .switch input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    cursor: pointer;
    background-color: #ccc;
    border-radius: 34px;
    transition: 0.3s;
  }

  .slider::before {
    position: absolute;
    width: 2em;
    height: 2em;
    content: '';
    background-color: var(--disabled-text);
    border-radius: 50%;
    transition: 0.3s;
    transform: translate(0%, -25%);
  }

  input:checked + .slider {
    background-color: var(--primary-ring);
  }

  input:checked + .slider::before {
    background-color: var(--primary-bg);
    transform: translate(100%, -25%);
  }
</style>
