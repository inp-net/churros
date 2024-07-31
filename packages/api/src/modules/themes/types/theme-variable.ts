import { builder } from '#lib';
import { ThemeVariable } from '@churros/db/prisma';

export const ThemeVariableType = builder.enumType(ThemeVariable, {
  name: 'ThemeVariable',
  description: "Les différentes variables qu'un thème peut définir",
  values: {
    ColorBackground: {
      description: 'Couleur de fond',
    },
    ColorBackground2: {
      description: 'Couleur de fond moins intense',
    },
    ColorBackground3: {
      description: 'Couleur de fond moins intense que ColorBackground2',
    },
    ColorBackground4: {
      description: 'Couleur de fond moins intense que ColorBackground3',
    },
    ColorShy: {
      description: "Couleur d'avant plan moins intense que ColorMuted",
    },
    ColorMuted: {
      description: "Couleur d'avant plan moins intense",
    },
    ColorForeground: {
      description: "Couleur d'avant plan",
    },
    ColorPrimary: {
      description: 'Couleur principale',
    },
    ColorSuccess: {
      description: 'Couleur des éléments de succès (souvent vert)',
    },
    ColorDanger: {
      description: 'Couleur des erreurs ou choses dangereuses (souvent rouge)',
    },
    ColorWarning: {
      description: 'Couleurs des avertissements',
    },
    ColorPrimaryBackground: {
      description: 'Couleur de fond pour ColorPrimary',
    },
    ColorSuccessBackground: {
      description: 'Couleur de fond pour ColorSuccess',
    },
    ColorDangerBackground: {
      description: 'Couleur de fond pour ColorDanger',
    },
    ColorWarningBackground: {
      description: 'Couleur de fond pour ColorWarning',
    },
    ImageLogoNavbarTop: {
      description: 'Image à utiliser à la place du logo dans la barre de navigation en haut',
    },
    ImageLogoNavbarSide: {
      description:
        'Image à utiliser à la place du logo dans la barre de navigation sur le côté (sur ordinateur)',
    },
    ImageBackgroundNavbarBottom: {
      description: 'Image à utiliser en fond de la barre de navigation en bas (sur mobile)',
    },
    ImageBackgroundNavbarTop: {
      description:
        "Image à utiliser en fond de la barre de navigation en haut (s'affiche seulement sur mobile)",
    },
    PatternBackground: {
      description: "Motif à répéter en fond de l'application",
    },
  },
});
