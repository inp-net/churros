import {
  type BooleanConstraint$options,
  type DocumentType$options,
  type EventFrequency$options,
  type EventManagerPowerLevel$options,
  type GroupType$options,
  type NotificationChannel$options,
  type PaymentMethod$options,
  type ThemeVariable$options,
  type ThemeVariant$options,
  type TicketCountingPolicy$options,
  type Visibility$options,
} from '$houdini';
import { NotificationChannel, Visibility } from '$lib/zeus';
import type { SvelteComponent } from 'svelte';
import LogoLydia from '~icons/custom-logos/lydia';
import LogoPaypal from '~icons/logos/paypal';
import IconGroupMembers from '~icons/mdi/account-group-outline';
import IconGodparent from '~icons/mdi/account-multiple-outline';
import IconAndroidStudio from '~icons/mdi/android-studio';
import IconNotification from '~icons/mdi/bell-outline';
import IconBookshelf from '~icons/mdi/bookshelf';
import IconBugCheck from '~icons/mdi/bug-check';
import IconCalendarEndOutline from '~icons/mdi/calendar-end-outline';
import IconCalendar from '~icons/mdi/calendar-multiselect-outline';
import IconCar from '~icons/mdi/car';
import IconCarrot from '~icons/mdi/carrot';
import IconStatus from '~icons/mdi/checkbox-marked-circle-outline';
import IconComment from '~icons/mdi/comment-outline';
import IconCoupon from '~icons/mdi/coupon';
import IconDomainSwitch from '~icons/mdi/domain-switch';
import IconFileDocumentOutline from '~icons/mdi/file-document-outline';
import IconForms from '~icons/mdi/form-select';
import IconGit from '~icons/mdi/git';
import IconServices from '~icons/mdi/hammer-screwdriver';
import IconHammerWrench from '~icons/mdi/hammer-wrench';
import IconHand from '~icons/mdi/hand-heart';
import IconHistory from '~icons/mdi/history';
import IconArticle from '~icons/mdi/note-text-outline';
import IconShotgun from '~icons/mdi/pistol';
import IconPlayBoxOutline from '~icons/mdi/play-box-outline';
import IconLogs from '~icons/mdi/pulse';
import IconPermissions from '~icons/mdi/shield-account-outline';
import IconSigma from '~icons/mdi/sigma';
import IconStar from '~icons/mdi/star-outline';
import IconDefisInte from '~icons/mdi/sword-cross';
import IconTerminal from '~icons/mdi/terminal';
import IconTestTube from '~icons/mdi/test-tube';
import IconWebsite from '~icons/mdi/web';
import IconBankTransfer from '~icons/msl/account-balance-outline';
import IconCash from '~icons/msl/account-balance-wallet-outline';
import IconPaymentCheck from '~icons/msl/checkbook-outline';
import IconExternalPayment from '~icons/msl/conversion-path';
import IconCreditCard from '~icons/msl/credit-card-outline';
import LogoFrappe from './components/LogoFrappe.svelte';

import { default as IconDotsHorizontal, default as IconQuestionMark } from '~icons/msl/more-horiz';

export const DISPLAY_PAYMENT_METHODS: Record<PaymentMethod$options, string> = {
  Cash: 'Espèces',
  Check: 'Chèque',
  Card: 'Carte bancaire',
  Transfer: 'Virement',
  Lydia: 'Lydia',
  Other: 'Autre',
  PayPal: 'PayPal',
  External: 'Externe à Churros',
};

export const ORDER_PAYMENT_METHODS: PaymentMethod$options[] = [
  'Lydia',
  'Cash',
  'External',
  'Card',
  'Check',
  'Transfer',
  'PayPal',
  'Other',
];

export const SHOP_PAYMENT_METHODS = {
  Cash: 'Espèces',
  Check: 'Chèque',
  Transfer: 'Virement',
  Lydia: 'Lydia',
  Other: 'Autre',
};

export const ORDER_VISIBILITIES: Visibility[] = [
  Visibility.Public,
  Visibility.SchoolRestricted,
  Visibility.GroupRestricted,
  Visibility.Unlisted,
  Visibility.Private,
];

export const DISPLAY_VISIBILITIES: Record<Visibility$options, string> = {
  Public: 'Public',
  SchoolRestricted: 'École',
  GroupRestricted: 'Groupe',
  Unlisted: 'Non répertorié',
  Private: 'Privé',
};

export const HELP_VISIBILITY: Record<Visibility$options, string> = {
  Public: 'Visible par tous (même sans être connecté)',
  GroupRestricted: 'Visible par les membres du groupe',
  SchoolRestricted: "Visible par les étudiant·e·s de cette l'école",
  Unlisted: 'Visible par tout ceux qui possèdent le lien',
  Private: 'Visible par personne (excepté les administrateur·ice·s et organisateur·ice·s)',
};

function naturalJoin(items: string[]): string {
  items = items.filter(Boolean);
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' et ' + items.at(-1);
}

export const HELP_VISIBILITY_DYNAMIC: (
  groups: Array<{ name: string; studentAssociation?: null | { school: { name: string } } }>,
) => Record<Visibility, string> = (groups) => ({
  Public: `Visible par tous (même sans être connecté)`,
  GroupRestricted: `Visible par les membres de ${naturalJoin([
    ...new Set(groups.map((g) => g.name)),
  ])}`,
  SchoolRestricted: `Visible par les étudiant·e·s de ${naturalJoin([
    ...new Set(groups.map((g) => g.studentAssociation?.school.name ?? '')),
  ])}`,
  Unlisted: 'Visible par tout ceux qui possèdent le lien',
  Private: 'Visible par personne (excepté les administrateur·ice·s et organisateur·ice·s)',
});

export const DISPLAY_NOTIFICATION_CHANNELS: Record<NotificationChannel, string> = {
  Articles: 'Posts',
  Shotguns: 'Shotguns',
  Comments: 'Commentaires',
  GodparentRequests: 'Demandes de parrainage',
  GroupBoard: 'Changements de bureau',
  Permissions: 'Changement de permissions',
  Mandatory: 'Notifications obligatoires',
  Other: 'Autres',
};

export const ORDER_NOTIFICATION_CHANNELS: NotificationChannel[] = [
  NotificationChannel.Shotguns,
  NotificationChannel.Articles,
  NotificationChannel.GodparentRequests,
  NotificationChannel.Comments,
  NotificationChannel.GroupBoard,
  NotificationChannel.Permissions,
  NotificationChannel.Other,
];

export const ICONS_NOTIFICATION_CHANNELS: Record<
  NotificationChannel$options,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof SvelteComponent<any>
> = {
  Articles: IconArticle,
  Shotguns: IconShotgun,
  Comments: IconComment,
  GodparentRequests: IconGodparent,
  GroupBoard: IconGroupMembers,
  Other: IconNotification,
  Mandatory: IconNotification,
  Permissions: IconPermissions,
};

export const DISPLAY_GROUP_TYPES: Record<GroupType$options, string> = {
  Association: 'Association',
  Club: 'Club',
  Group: 'Groupe',
  Integration: "Groupe d'inté",
  StudentAssociationSection: "Bureau de l'AE",
  List: 'Liste',
};

export const DISPLAY_MANAGER_PERMISSION_LEVELS: Record<EventManagerPowerLevel$options, string> = {
  ReadOnly: 'Lecture seule',
  ScanTickets: 'Scan des billets',
  Edit: 'Modification',
  EditPermissions: 'Gestion totale',
};

// TODO remove
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ICONS_PAYMENT_METHODS: Record<PaymentMethod$options, typeof SvelteComponent<any>> = {
  Card: IconCreditCard,
  Cash: IconCash,
  Check: IconPaymentCheck,
  Lydia: LogoLydia,
  Other: IconQuestionMark,
  Transfer: IconBankTransfer,
  PayPal: LogoPaypal,
  External: IconExternalPayment,
};

export const DISPLAY_EVENT_FREQUENCY: Record<EventFrequency$options, string> = {
  Biweekly: 'Une semaine sur deux',
  Monthly: 'Mensuel',
  Weekly: 'Hebdomadaire',
  Once: 'Une seule fois',
};

export const DISPLAY_DOCUMENT_TYPES = new Map<DocumentType$options, string>([
  ['CourseNotes', 'Notes de cours'],
  ['CourseSlides', 'Diapositives du cours'],
  ['Exam', 'Partiel'],
  ['Exercises', 'TD'],
  ['GradedExercises', 'DM'],
  ['Miscellaneous', 'Autre'],
  ['Practical', 'TP'],
  ['PracticalExam', 'BE'],
  ['Summary', 'Fiche'],
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ICONS_DOCUMENT_TYPES = new Map<DocumentType$options, typeof SvelteComponent<any>>([
  ['CourseNotes', IconFileDocumentOutline],
  ['CourseSlides', IconPlayBoxOutline],
  ['Exam', IconCalendarEndOutline],
  ['Exercises', IconAndroidStudio],
  ['GradedExercises', IconStar],
  ['Miscellaneous', IconDotsHorizontal],
  ['Practical', IconTestTube],
  ['PracticalExam', IconHammerWrench],
  ['Summary', IconSigma],
]);

export const ORDER_DOCUMENT_TYPES: DocumentType$options[] = [
  'Exam',
  'Summary',
  'CourseNotes',
  'Exercises',
  'GradedExercises',
  'Practical',
  'PracticalExam',
  'CourseSlides',
  'Miscellaneous',
];

export const ORDER_REACTIONS = ['❤️', '👍', '👎', '😂', '😮', '😡', '💀', '🎉'] as const;

// export const ICONS_REACTIONS: Record<typeof ORDER_REACTIONS[number], {outlined: SvelteComponent<any>, filled: SvelteComponent<any>} > = {
//   '❤️': {
//     filled: IconHeart,
//     outlined:
//   }
// }

export function orderedDisplay<T extends string | number | symbol>(
  order: T[],
  display: Record<T, string>,
): Array<[T, string]> {
  return order.map((value) => [value, display[value]] as [T, string]);
}

export const DISPLAY_CHANGELOG_CATEGORIES = new Map<
  (typeof ORDER_CHANGELOG_CATEGORIES)[number],
  string
>([
  ['added', 'Nouveautés'],
  ['improved', 'Améliorations'],
  ['fixed', 'Corrections'],
  ['security', 'Sécurité'],
  ['other', 'Autres'],
  ['technical', 'Technique'],
]);

export const ORDER_CHANGELOG_CATEGORIES = [
  'added',
  'improved',
  'fixed',
  'security',
  'other',
  'technical',
] as const;

export const DISPLAY_BOOLEAN_CONSTRAINT: Record<BooleanConstraint$options, string> = {
  DontCare: 'Peu importe',
  Only: 'Seulement',
  Not: 'Interdit',
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ICONS_SERVICES: Map<string, typeof SvelteComponent<any>> = new Map([
  ['car', IconCar],
  ['defis', IconDefisInte],
  ['hand', IconHand],
  ['terminal', IconTerminal],
  ['website', IconWebsite],
  ['carrot', IconCarrot],
  ['logs', IconLogs],
  ['domainswitch', IconDomainSwitch],
  ['calendar', IconCalendar],
  ['git', IconGit],
  ['book', IconBookshelf],
  ['frappe', LogoFrappe],
  ['coupon', IconCoupon],
  ['status', IconStatus],
  ['history', IconHistory],
  ['bug-check', IconBugCheck],
  ['services', IconServices],
  ['forms', IconForms],
]);

export function formatEUR(price: number) {
  return Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export const DISPLAY_TICKET_COUNTING_POLICY: Record<TicketCountingPolicy$options, string> = {
  OnBooked: 'Dès la réservation',
  OnPaid: 'Après le paiement',
};

export const DISPLAY_GROUP_MEMBER_PERMISSIONS: Record<
  'canScanEvents' | 'canEditArticles' | 'canEditMembers',
  string
> = {
  canEditArticles: 'Gestion des posts et évènements',
  canEditMembers: 'Gestion des membres',
  canScanEvents: 'Scan de billets',
};

export const DISPLAY_THEME_VARIANT: Record<ThemeVariant$options, string> = {
  Dark: 'Sombre',
  Light: 'Clair',
};

export const DISPLAY_THEME_VARIABLE: Record<ThemeVariable$options, string> = {
  ColorBackground: 'Couleur de fond',
  ColorBackground2: 'Couleur de fond moins intense',
  ColorBackground3: 'Couleur de fond moins intense que ColorBackground2',
  ColorBackground4: 'Couleur de fond moins intense que ColorBackground3',
  ColorDanger: 'Couleur des erreurs ou choses dangereuses (souvent rouge)',
  ColorDangerBackground: 'Couleur de fond pour ColorDanger',
  ColorForeground: "Couleur d'avant plan",
  ColorMuted: "Couleur d'avant plan moins intense",
  ColorPrimary: 'Couleur principale',
  ColorPrimaryBackground: 'Couleur de fond pour ColorPrimary',
  ColorShy: "Couleur d'avant plan moins intense que ColorMuted",
  ColorSuccess: 'Couleur des éléments de succès (souvent vert)',
  ColorSuccessBackground: 'Couleur de fond pour ColorSuccess',
  ColorWarning: 'Couleurs des avertissements',
  ColorWarningBackground: 'Couleur de fond pour ColorWarning',
  ImageLogoNavbarTop: 'Logo de la barre de navigation en haut',
  ImageLogoNavbarSide: 'Logo de la barre de navigation sur le côté',
  ImageBackgroundNavbarBottom: 'Fond de la barre de navigation en bas',
  ImageBackgroundNavbarTop: 'Fond de la barre de navigation en haut',
  PatternBackground: 'Fond avec motif',
};
export function stringifyCapacity(
  capacity: null | number | App.CapacityUnlimitedValue,
  fallback = '',
): string {
  if (capacity === undefined) return fallback;
  if (capacity === null) return fallback;
  if (capacity === 'Unlimited') return fallback;
  return capacity.toString();
}
