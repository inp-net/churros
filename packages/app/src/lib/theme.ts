import { onMount } from 'svelte'
import { writable } from 'svelte/store'
import { browser } from '$app/env'

/** Current theme, as a writable store. */
export const theme = writable('light', (set) => {
  // It's not possible to load the theme on the server
  if (!browser) return

  // Try to load the theme from localStorage or fallback to 'light'
  let currentTheme: string | undefined = localStorage.getItem('theme') ?? 'light'
  set(currentTheme)

  // Update the page when the theme changes
  onMount(() =>
    theme.subscribe(($theme) => {
      if (currentTheme) document.documentElement.classList.remove(currentTheme)
      localStorage.setItem('theme', $theme)
      document.documentElement.classList.add($theme)
      currentTheme = $theme
    })
  )
})
