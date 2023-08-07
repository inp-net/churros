<script lang="ts">
  export let value: boolean;
  export let label: string;
</script>

<label class="switch-container">
  <div class="switch">
    <input type="checkbox" bind:checked={value} />
    <span class="slider" />
  </div>
  {label}
</label>

<style>
  .switch-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 2.3em;
    height: 0.75em;
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
    border-radius: 1000000px;
    transition: 0.125s;
  }

  .slider::before {
    position: absolute;
    width: 1.5em;
    height: 1.5em;
    content: '';
    background-color: var(--disabled-text);
    border-radius: 50%;
    transition: 0.125s;
    transform: translate(0%, -25%);
  }

  input:checked + .slider {
    background-color: var(--primary-ring);
  }

  input:checked + .slider::before {
    background-color: var(--primary-bg);

    /* transform: translate(100%, -25%); */
    transform: translate(calc(2.3em - 1.5em), -25%);
  }
</style>
