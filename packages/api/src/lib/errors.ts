import i18next from 'i18next';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

// XXX: must be the same as in the frontend
// TODO: use a separate error instead
export const UNAUTHORIZED_ERROR_MESSAGE = "Tu n'es pas autorisé à effectuer cette action.";

export class UnauthorizedError extends Error {
  constructor() {
    super(UNAUTHORIZED_ERROR_MESSAGE);
  }
}

const zodTranslations = {
  errors: {
    invalid_type: 'Le type « {{expected}} » est attendu mais « {{received}} » a été reçu',
    invalid_type_received_undefined: 'Obligatoire',
    invalid_type_received_null: 'Obligatoire',
    invalid_literal: 'La valeur doit être {{expected}}',
    unrecognized_keys: "Une ou plusieurs clé(s) non reconnue(s) dans l'objet : {{- keys}}",
    invalid_union: 'Champ non valide',
    invalid_union_discriminator:
      'La valeur du discriminateur est non valide. Options attendues : {{- options}}',
    invalid_enum_value: "La valeur « {{received}} » n'existe pas dans les options : {{- options}}",
    invalid_arguments: 'Les arguments de la fonction sont non valides',
    invalid_return_type: "Le type de retour de la fonction n'est pas valide",
    invalid_date: 'La date est non valide',
    custom: 'Champ non valide',
    invalid_intersection_types: "Les résultats d'intersection n'ont pas pu être fusionnés",
    not_multiple_of: 'Le nombre doit être un multiple de {{multipleOf}}',
    not_finite: 'Le nombre doit être fini',
    invalid_string: {
      email: '{{validation}} non valide',
      url: '{{validation}} non valide',
      uuid: '{{validation}} non valide',
      cuid: '{{validation}} non valide',
      regex: '{{validation}} non valide',
      datetime: '{{validation}} non valide',
      startsWith: 'Le champ doit commencer par « {{startsWith}} »',
      endsWith: 'Le champ doit se terminer par « {{endsWith}} »',
    },
    too_small: {
      array: {
        exact: 'La liste doit contenir exactement {{minimum}} élément(s)',
        inclusive: 'La liste doit contenir au moins {{minimum}} élément(s)',
        not_inclusive: 'La liste doit contenir plus de {{minimum}} élément(s)',
      },
      string: {
        exact: 'La chaîne doit contenir exactement {{minimum}} caractère(s)',
        inclusive: 'La chaîne doit contenir au moins {{minimum}} caractère(s)',
        not_inclusive: 'La chaîne doit contenir plus de {{minimum}} caractère(s)',
      },
      number: {
        exact: 'Le nombre doit être égal à {{minimum}}',
        inclusive: 'Le nombre doit être supérieur ou égal à {{minimum}}',
        not_inclusive: 'Le nombre doit être supérieur à {{minimum}}',
      },
      set: {
        exact: 'Champ non valide',
        inclusive: 'Champ non valide',
        not_inclusive: 'Champ non valide',
      },
      date: {
        exact: 'La date doit être égale au {{- minimum, datetime}}',
        inclusive: 'La date doit être ultérieure ou égale au {{- minimum, datetime}}',
        not_inclusive: 'La date doit être ultérieure au {{- minimum, datetime}}',
      },
    },
    too_big: {
      array: {
        exact: 'La liste doit contenir exactement {{maximum}} élément(s)',
        inclusive: 'La liste doit contenir au plus {{maximum}} élément(s)',
        not_inclusive: 'La liste doit contenir moins de {{maximum}} élément(s)',
      },
      string: {
        exact: 'La chaîne doit contenir exactement {{maximum}} caractère(s)',
        inclusive: 'La chaîne doit contenir au plus {{maximum}} caractère(s)',
        not_inclusive: 'La chaîne doit contenir moins de {{maximum}} caractère(s)',
      },
      number: {
        exact: 'Le nombre doit être égal à {{maximum}}',
        inclusive: 'Le nombre doit être inférieur ou égal à {{maximum}}',
        not_inclusive: 'Le nombre doit être inférieur à {{maximum}}',
      },
      set: {
        exact: 'Champ non valide',
        inclusive: 'Champ non valide',
        not_inclusive: 'Champ non valide',
      },
      date: {
        exact: 'La date doit être égale au {{- maximum, datetime}}',
        inclusive: 'La date doit être antérieure ou égale au {{- maximum, datetime}}',
        not_inclusive: 'La date doit être antérieure au {{- maximum, datetime}}',
      },
    },
  },
  validations: {
    email: 'e-mail',
    url: 'lien',
    uuid: 'UUID',
    cuid: 'CUID',
    regex: 'expression régulière',
    datetime: 'horodate',
  },
  types: {
    function: 'fonction',
    number: 'nombre',
    string: 'chaîne de caractères',
    nan: 'NaN',
    integer: 'entier',
    float: 'décimal',
    boolean: 'booléen',
    date: 'date',
    bigint: 'grand entier',
    undefined: 'undefined',
    symbol: 'symbole',
    null: 'null',
    array: 'liste',
    object: 'objet',
    unknown: 'inconnu',
    promise: 'promise',
    void: 'void',
    never: 'never',
    map: 'map',
    set: 'ensemble',
  },
};

i18next.init({
  lng: 'fr',
  resources: {
    fr: { zod: zodTranslations },
  },
});
const zodMap = makeZodI18nMap({ t: i18next.t });

export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_string && issue.validation === 'email')
    return { message: 'Adresse email invalide.' };

  if (issue.code === z.ZodIssueCode.too_small && issue.type === 'string' && issue.minimum === 1)
    return { message: 'Ce champ est obligatoire' };

  const { message } = zodMap(issue, ctx);
  return {
    message: message ?? ctx.defaultError,
  };
};
