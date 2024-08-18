import { Colord, type RgbaColor } from 'colord';

// Following source code is taken from
// https://github.com/omgovich/colord/blob/master/src/plugins/names.ts
// but localized in french and with possibly more colors to accomodate for List's color names

// From https://fr.wikipedia.org/wiki/Liste_de_noms_de_couleur
const COLOR_NAME_TO_HEX: Record<string, string> = {
  'Abricot': '#E67E30',
  'Acajou': '#88421D',
  'Aigue-marine': '#79F8F8',
  'Amande': '#82C46C',
  'Amarante': '#91283B',
  'Ambre': '#F0C300',
  'Améthyste': '#884DA7',
  'Anthracite': '#303030',
  'Argent': '#FFFFFF',
  'Aubergine': '#370028',
  'Aurore': '#FFCB60',
  'Avocat': '#568203',
  'Azur': '#007FFF',
  'Beurre': '#F0E36B',
  'Bis': '#766F64',
  'Bisque': '#FFE4C4',
  'Bistre': '#856D4D',
  'Bitume': '#4E3D28',
  'Blanc cassé': '#FEFEE2',
  'Blanc lunaire': '#F4FEFE',
  'Blé': '#E8D630',
  'Bleu acier': '#3A8EBA',
  'Bleu bleuet': '#5472AE',
  'Bleu canard': '#048B9A',
  'Bleu charrette': '#8EA2C6',
  'Bleu ciel': '#77B5FE',
  'Bleu de cobalt': '#22427C',
  'Bleu de Prusse': '#24445C',
  'Bleu électrique': '#2C75FF',
  'Bleu givré': '#80D0D0',
  'Bleu marine': '#03224C',
  'Bleu nuit': '#0F056B',
  'Bleu outremer': '#004787',
  'Bleu paon': '#067790',
  'Bleu persan': '#4E63CE',
  'Bleu pétrole': '#1D4851',
  'Bleu roi': '#318CE7',
  'Bleu saphir': '#0131B4',
  'Bleu turquin': '#425B8A',
  "Bouton d'or": '#FCDC12',
  'Brique': '#842E1B',
  'Bronze': '#614E1A',
  'Brou de noix': '#3F2204',
  "Caca d'oie": '#CDCD0D',
  'Cacao': '#614B3A',
  'Cachou': '#2F1B0C',
  'Café': '#462E01',
  'Cannelle': '#7E5835',
  'Capucine': '#FF5E4D',
  'Caramel': '#7E3300',
  'Carmin': '#960018',
  'Carotte': '#F4661B',
  'Chamois': '#D0C07A',
  'Chartreuse': '#7FFF00',
  'Chaudron': '#85530F',
  'Chocolat': '#5A3A22',
  'Cinabre': '#DB1702',
  'Citrouille': '#DF6D14',
  'Cœruleum': '#357AB7',
  "Coquille d'œuf": '#FDE9E0',
  'Corail': '#E73E01',
  'Cramoisi': '#DC143C',
  'Cuisse de nymphe': '#FEE7F0',
  'Cuivre': '#B36700',
  'Cyan': '#2BFAFA',
  'Écarlate': '#ED0000',
  'Écru': '#FEFEE0',
  'Émeraude': '#00815F',
  'Fauve': '#AD4F09',
  'Flave': '#E6E697',
  'Fraise': '#BF3030',
  'Framboise': '#C72C48',
  'Fumée': '#BBD2E1',
  'Garance': '#EE1010',
  'Glauque': '#649B88',
  'Glycine': '#C9A0DC',
  'Grège': '#BBAE98',
  'Grenadine': '#E9383F',
  'Grenat': '#6E0B14',
  'Gris acier': '#AFAFAF',
  'Gris de Payne': '#677179',
  'Gris fer': '#7F7F7F',
  'Gris perle': '#CECECE',
  'Gris souris': '#9E9E9E',
  'Groseille': '#CF0A1D',
  'Gueules': '#E21313',
  'Héliotrope': '#DF73FF',
  'Incarnat': '#FF6F7D',
  'Indigo': '#791CF8',
  'Indigo foncé': '#2E006C',
  'Isabelle': '#FEA777',
  'Jaune canari': '#E7F00D',
  'Jaune citron': '#F7FF3C',
  'Jaune de cobalt': '#FDEE00',
  'Jaune de Mars': '#EED153',
  'Jaune de Naples': '#FFF0BC',
  'Jaune impérial': '#FFE436',
  'Jaune mimosa': '#FEF86C',
  'Lapis-lazuli': '#26619C',
  'Lavallière': '#8F5922',
  'Lavande': '#9683EC',
  'Lie de vin': '#AC1E44',
  'Lilas': '#B666D2',
  'Lime ou vert citron': '#9EFD38',
  'Lin': '#FAF0E6',
  'Magenta': '#FF00FF',
  'Maïs': '#FFDE75',
  'Malachite': '#1FA055',
  'Mandarine': '#FEA347',
  'Marron': '#582900',
  'Mastic': '#B3B191',
  'Mauve': '#D473D4',
  'Menthe': '#16B84E',
  'Moutarde': '#C7CF00',
  'Nacarat': '#FC5D5D',
  'Nankin': '#F7E269',
  'Noisette': '#955628',
  'Ocre': '#DFAF2C',
  'Ocre rouge': '#DD985C',
  'Olive': '#708D23',
  'Or': '#FFD700',
  'Orange brûlé': '#CC5500',
  'Orchidée': '#DA70D6',
  'Orpiment': '#FCD21C',
  'Paille': '#FEE347',
  'Parme': '#CFA0E9',
  "Pelure d'oignon": '#D58490',
  'Pervenche': '#CCCCFF',
  'Pistache': '#BEF574',
  'Poil de chameau': '#B67823',
  'Ponceau': '#C60800',
  'Pourpre': '#9E0E40',
  'Prasin': '#4CA66B',
  'Prune': '#811453',
  'Puce': '#4E1609',
  'Rose Mountbatten': '#997A8D',
  'Rouge anglais': '#F7230C',
  'Rouge cardinal': '#B82010',
  'Rouge cerise': '#BB0B0B',
  "Rouge d'Andrinople": '#A91101',
  'Rouge de Falun': '#801818',
  'Rouge feu': '#FF4901',
  'Rouge indien': '#CD5C5C',
  'Rouge tomate': '#DE2916',
  'Rouge tomette': '#AE4A34',
  'Rouille': '#985717',
  'Rubis': '#E0115F',
  'Sable': '#E0CDA9',
  'Safre': '#0131B4',
  'Sang de bœuf': '#730800',
  'Sanguine': '#850606',
  'Sarcelle': '#008080',
  'Saumon': '#F88E55',
  'Sépia': '#AE8964',
  'Sinople': '#149414',
  'Smalt': '#003399',
  'Soufre': '#FFFF6B',
  'Tabac': '#9F551E',
  'Taupe': '#463F32',
  "Terre d'ombre": '#926D27',
  'Topaze': '#FAEA73',
  'Tourterelle': '#BBACAC',
  'Turquoise': '#25FDE9',
  'Vanille': '#E1CE9A',
  'Vermeil': '#FF0921',
  'Vermillon': '#DB1702',
  'Vert bouteille': '#096A09',
  'Vert céladon': '#83A697',
  "Vert d'eau": '#B0F2B6',
  'Vert-de-gris': '#95A595',
  'Vert de Hooker': '#1B4F08',
  'Vert de vessie': '#22780F',
  'Vert épinard': '#175732',
  'Vert impérial': '#00561B',
  'Vert lichen': '#85C17E',
  'Vert oxyde de chrome': '#18391E',
  'Vert perroquet': '#3AF24B',
  'Vert poireau': '#4CA66B',
  'Vert pomme': '#34C924',
  'Vert prairie': '#57D53B',
  'Vert printemps': '#00FF7F',
  'Vert sapin': '#095228',
  'Vert sauge': '#689D71',
  'Vert tilleul': '#A5D152',
  'Vert Véronèse': '#5A6521',
  'Violet': '#8806CE',
  "Violet d'évêque": '#723E64',
  'Viride': '#40826D',
  'Zinzolin': '#6C0277',
};
// Second dictionary to provide faster search by HEX value
const HEX_NAME_STORE: Record<string, string> = {};
for (const name in COLOR_NAME_TO_HEX) HEX_NAME_STORE[COLOR_NAME_TO_HEX[name]] = name;

// Third dictionary to cache RGBA values (useful for distance calculation)
const NAME_RGBA_STORE: Record<string, RgbaColor> = {};

// Finds a distance between two colors
// See https://www.wikiwand.com/en/Color_difference
const getDistanceBetween = (rgb1: RgbaColor, rgb2: RgbaColor) => {
  return (rgb1.r - rgb2.r) ** 2 + (rgb1.g - rgb2.g) ** 2 + (rgb1.b - rgb2.b) ** 2;
};

/**
 * Plugin to work with named colors.
 * Adds a parser to read CSS color names and `toName` method.
 * See https://www.w3.org/TR/css-color-4/#named-colors
 * Supports 'transparent' string as defined in
 * https://drafts.csswg.org/css-color/#transparent-color
 */
export function colorName(colorstring: string) {
  // the color names are case-insensitive according to CSS Color Level 3
  const name = colorstring.toLowerCase();
  // "transparent" is a shorthand for transparent black
  const hex = name === 'transparent' ? '#0000' : COLOR_NAME_TO_HEX[name];
  const color = new Colord(hex || colorstring);

  // Define new color conversion method
  // Process "transparent" keyword
  // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#transparent_keyword
  if (!color.rgba.a && !color.rgba.r && !color.rgba.g && !color.rgba.b) return 'transparent';

  // Return exact match right away
  const exactMatch = HEX_NAME_STORE[color.toHex()];
  if (exactMatch) return exactMatch;

  // Find closest color, if there is no exact match and `approximate` flag enabled
  const rgba = color.toRgb();
  let minDistance = Number.POSITIVE_INFINITY;
  let closestMatch = 'black';

  // Fill the dictionary if empty
  if (!NAME_RGBA_STORE.length) {
    for (const name in COLOR_NAME_TO_HEX)
      NAME_RGBA_STORE[name] = new Colord(COLOR_NAME_TO_HEX[name]).toRgb();
  }

  // Find the closest color
  for (const name in COLOR_NAME_TO_HEX) {
    const distance = getDistanceBetween(rgba, NAME_RGBA_STORE[name]);
    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = name;
    }
  }

  return closestMatch;
}
