import {
  graphql,
  ThemesCSSFileStore,
  type ThemesCSSFile$result,
  type ThemeVariable$options,
} from '$houdini';
import { THEME_CSS_VARIABLE_NAMES } from '$lib/theme.js';

graphql(`
  query ThemesCSSFile {
    themes {
      localID
      name
      author {
        uid
      }
      dark: values(variant: Dark) {
        variable
        value
      }
      light: values(variant: Light) {
        variable
        value
      }
    }
  }
`);

export async function GET(event) {
  const themes = await new ThemesCSSFileStore()
    .fetch({ event })
    .then((res) => res.data?.themes ?? []);

  return new Response(themes.map((t) => themeCSSDeclaration(t)).join('\n\n'), {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

function isImageVariable(variable: ThemeVariable$options): boolean {
  return variable.startsWith('Image') || variable.startsWith('Pattern');
}

function themeCSSDeclaration(theme: ThemesCSSFile$result['themes'][number]): string {
  return `
/** Thème “${theme.name}” ${theme.author ? `par @${theme.author.uid}` : ''} */

/* Variante claire */
:root[data-theme="${theme.localID}"][data-theme-variant="light"],
dialog[data-theme="${theme.localID}"][data-theme-variant="light"],
dialog[data-theme="${theme.localID}"][data-theme-variant="light"]::backdrop {
    ${theme.light.map(({ variable, value }) => `--${THEME_CSS_VARIABLE_NAMES[variable]}: ${isImageVariable(variable) ? `url('${value}')` : value};`).join('\n')}
    --theme-id: "${theme.localID}";
}

/* Variante sombre */
:root[data-theme="${theme.localID}"][data-theme-variant="dark"],
dialog[data-theme="${theme.localID}"][data-theme-variant="dark"],
dialog[data-theme="${theme.localID}"][data-theme-variant="dark"]::backdrop {
    ${theme.dark.map(({ variable, value }) => `--${THEME_CSS_VARIABLE_NAMES[variable]}: ${isImageVariable(variable) ? `url('${value}')` : value};`).join('\n')}
    --theme-id: "${theme.localID}";
}
    
`;
}
