import { browser } from '$app/environment';
import {
  fragment,
  graphql,
  type ThemeValuesForEditing,
  type ThemeVariable$options,
  type ThemeVariant$options,
} from '$houdini';
import { syncToLocalStorage } from 'svelte-store2storage';
import { get, writable } from 'svelte/store';

export const THEME_CSS_VARIABLE_NAMES: Record<ThemeVariable$options, string> = {
  ColorBackground: 'bg',
  ColorBackground2: 'bg2',
  ColorBackground3: 'bg3',
  ColorBackground4: 'bg4',
  ColorShy: 'shy',
  ColorMuted: 'muted',
  ColorForeground: 'fg',
  ColorPrimary: 'primary',
  ColorSuccess: 'success',
  ColorDanger: 'danger',
  ColorWarning: 'warning',
  ColorPrimaryBackground: 'primary-bg',
  ColorSuccessBackground: 'success-bg',
  ColorDangerBackground: 'danger-bg',
  ColorWarningBackground: 'warning-bg',
  ImageLogoNavbarTop: 'logo-navbar-top',
  ImageLogoNavbarSide: 'logo-navbar-side',
  ImageBackgroundNavbarBottom: 'bg-navbar-bottom',
  ImageBackgroundNavbarTop: 'bg-navbar-top',
  PatternBackground: 'bg-pattern',
};

/** Current theme, as a writable store. */
export const theme = writable<{
  id: string | 'system';
  variant: 'light' | 'dark' | 'auto';
}>(
  {
    id: 'system',
    variant: 'auto',
  },
  (set) => {
    // It's not possible to load the theme on the server
    if (!browser) return;

    // Recover possibly invalid theme variants
    const definedVariants = ['light', 'dark', 'auto'];
    let variant = localStorage.getItem('themeVariant') ?? 'auto';
    if (!definedVariants.includes(variant)) variant = 'auto';

    // Try to load the theme from localStorage
    set({
      // Invalid theme IDs will resolve to the default theme (as the CSS for the default theme just doesn't have the [data-theme=...] selector)
      id: localStorage.getItem('theme') ?? 'system',
      variant: variant as 'light' | 'dark' | 'auto',
    });
  },
);

export const editingTheme = writable<{
  id: string;
  variant: 'light' | 'dark' | 'auto';
} | null>(null);

if (browser) syncToLocalStorage(editingTheme, 'editingTheme');

export const isDark = writable(false);

if (browser) {
  theme.subscribe(($theme) => {
    localStorage.setItem('theme', $theme.id);
    localStorage.setItem('themeVariant', $theme.variant);
    if ($theme.variant === 'auto')
      isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    else isDark.set($theme.variant === 'dark');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
    if ((localStorage.getItem('themeVariant') ?? 'auto') === 'auto') isDark.set(matches);
  });

  isDark.subscribe(($isDark) => {
    document.documentElement.dataset.themeVariant = $isDark ? 'dark' : 'light';
  });
}
export function baseValues(
  variant: ThemeVariant$options,
  baseValuesGetter: HTMLDivElement,
): Record<ThemeVariable$options, string> {
  if (!baseValuesGetter)
    {return Object.fromEntries(Object.keys(THEME_CSS_VARIABLE_NAMES).map((v) => [v, ''])) as Record<
      ThemeVariable$options,
      string
    >;}

  const getter = baseValuesGetter.querySelector(`.${variant}`);
  if (!getter)
    {return Object.fromEntries(Object.keys(THEME_CSS_VARIABLE_NAMES).map((v) => [v, ''])) as Record<
      ThemeVariable$options,
      string
    >;}

  return Object.fromEntries(
    Object.keys(THEME_CSS_VARIABLE_NAMES).map((variable) => {
      const value = getComputedStyle(getter).getPropertyValue(
        `--${THEME_CSS_VARIABLE_NAMES[variable as ThemeVariable$options]}`,
      );
      return [variable, value];
    }),
  ) as Record<ThemeVariable$options, string>;
}

export function actualValues(
  baseValuesGetter: HTMLDivElement,
  themeValues: ThemeValuesForEditing | null,
) {
  const data = get(
    fragment(
      themeValues,
      graphql(`
        fragment ThemeValuesForEditing on Theme @loading {
          lightValues: values(variant: Light) {
            variable
            value
          }
          darkValues: values(variant: Dark) {
            variable
            value
          }
        }
      `),
    ),
  );
  return {
    Dark: {
      ...baseValues('Dark', baseValuesGetter),
      ...Object.fromEntries(data?.darkValues.map((v) => [v.variable, v.value]) ?? []),
    },
    Light: {
      ...baseValues('Light', baseValuesGetter),
      ...Object.fromEntries(data?.lightValues.map((v) => [v.variable, v.value]) ?? []),
    },
  };
}

export function colorValues(values: Record<ThemeVariable$options, string>) {
  return Object.entries(values).filter(([v]) => v.startsWith('Color')) as Array<
    [ThemeVariable$options & `Color${string}`, string]
  >;
}

export function urlValues(values: Record<ThemeVariable$options, string>) {
  return Object.entries(values).filter(([v]) => /^(Pattern|Image)/.test(v)) as Array<
    [ThemeVariable$options, string]
  >;
}

export function themeCurrentValue(variable: ThemeVariable$options): string {
  if (!browser) return '';
  return getComputedStyle(document.body).getPropertyValue(
    `--${THEME_CSS_VARIABLE_NAMES[variable]}`,
  );
}

export function themeCurrentValueURL(variable: ThemeVariable$options): string {
  return themeCurrentValue(variable).replace(/url\((["'])(.+)\1\)/, '$2');
}
