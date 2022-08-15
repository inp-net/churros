<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import InputGroup from '../groups/InputGroup.svelte';
  import GhostButton from './GhostButton.svelte';
</script>

<Meta
  title="Components/Buttons/GhostButton"
  component={GhostButton}
  argTypes={{ onClick: { action: 'click' } }}
/>

<Story name="Default" let:args>
  <GhostButton on:click={args.onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
      <path
        d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"
      />
    </svg>
  </GhostButton>
</Story>

<Story name="Grouped">
  <InputGroup>
    <GhostButton>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="icon"
      >
        <path d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z" />
      </svg>
    </GhostButton>
    <GhostButton>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="icon"
      >
        <path
          d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"
        />
      </svg>
    </GhostButton>
    <GhostButton>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="icon"
      >
        <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
      </svg>
    </GhostButton>
  </InputGroup>
</Story>
