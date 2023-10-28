import {
  NotificationChannel,
  DocumentType,
  type EventFrequency,
  type GroupType,
  type PaymentMethod,
  Visibility,
} from '$lib/zeus';
import LogoLydia from '~icons/simple-icons/lydia';
import IconCreditCard from '~icons/mdi/credit-card-outline';
import IconCash from '~icons/mdi/hand-coin-outline';
import IconPaymentCheck from '~icons/mdi/checkbook';
import IconQuestionMark from '~icons/mdi/dots-horizontal';
import IconBankTransfer from '~icons/mdi/bank';
import IconArticle from '~icons/mdi/note-text-outline';
import IconShotgun from '~icons/mdi/pistol';
import IconComment from '~icons/mdi/comment-outline';
import IconGodparent from '~icons/mdi/account-multiple-outline';
import IconGroupMembers from '~icons/mdi/account-group-outline';
import IconNotification from '~icons/mdi/bell-outline';
import IconFileDocumentOutline from '~icons/mdi/file-document-outline';
import IconPlayBoxOutline from '~icons/mdi/play-box-outline';
import IconCalendarEndOutline from '~icons/mdi/calendar-end-outline';
import IconAndroidStudio from '~icons/mdi/android-studio';
import IconStar from '~icons/mdi/star-outline';
import IconDotsHorizontal from '~icons/mdi/dots-horizontal';
import IconTestTube from '~icons/mdi/test-tube';
import IconHammerWrench from '~icons/mdi/hammer-wrench';
import IconSigma from '~icons/mdi/sigma';
import IconPermissions from '~icons/mdi/shield-account-outline';
import type { SvelteComponent } from 'svelte';

export const DISPLAY_PAYMENT_METHODS = {
  Cash: 'Espèces',
  Check: 'Chèque',
  Card: 'Carte bancaire',
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

export const DISPLAY_VISIBILITIES: Record<Visibility, string> = {
  Public: 'Public',
  GroupRestricted: 'Groupe',
  SchoolRestricted: 'École',
  Unlisted: 'Non répertorié',
  Private: 'Privé',
};

export const HELP_VISIBILITY: Record<Visibility, string> = {
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
  groups: Array<{ name: string; studentAssociation?: { school: { name: string } } }>,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ICONS_NOTIFICATION_CHANNELS: Record<NotificationChannel, typeof SvelteComponent<any>> =
  {
    Articles: IconArticle,
    Shotguns: IconShotgun,
    Comments: IconComment,
    GodparentRequests: IconGodparent,
    GroupBoard: IconGroupMembers,
    Other: IconNotification,
    Permissions: IconPermissions,
  };

export const DISPLAY_GROUP_TYPES: Record<GroupType, string> = {
  Association: 'Association',
  Club: 'Club',
  Group: 'Groupe',
  Integration: "Groupe d'inté",
  StudentAssociationSection: "Bureau de l'AE",
  List: 'Liste',
};

export const DISPLAY_MANAGER_PERMISSION_LEVELS = {
  readonly: 'Lecture seule',
  verifyer: 'Vérification des billets',
  editor: 'Modification',
  fullaccess: 'Gestion totale',
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PAYMENT_METHODS_ICONS: Record<PaymentMethod, typeof SvelteComponent<any>> = {
  Card: IconCreditCard,
  Cash: IconCash,
  Check: IconPaymentCheck,
  Lydia: LogoLydia,
  Other: IconQuestionMark,
  Transfer: IconBankTransfer,
};

export const DISPLAY_EVENT_FREQUENCY: Record<EventFrequency, string> = {
  Biweekly: 'Une semaine sur deux',
  Monthly: 'Mensuel',
  Weekly: 'Hebdomadaire',
  Once: 'Une seule fois',
};

export const DISPLAY_DOCUMENT_TYPES = new Map<DocumentType, string>([
  [DocumentType.CourseNotes, 'Notes de cours'],
  [DocumentType.CourseSlides, 'Diapositives du cours'],
  [DocumentType.Exam, 'Partiel'],
  [DocumentType.Exercises, 'TD'],
  [DocumentType.GradedExercises, 'DM'],
  [DocumentType.Miscellaneous, 'Autre'],
  [DocumentType.Practical, 'TP'],
  [DocumentType.PracticalExam, 'BE'],
  [DocumentType.Summary, 'Fiche'],
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ICONS_DOCUMENT_TYPES = new Map<DocumentType, typeof SvelteComponent<any>>([
  [DocumentType.CourseNotes, IconFileDocumentOutline],
  [DocumentType.CourseSlides, IconPlayBoxOutline],
  [DocumentType.Exam, IconCalendarEndOutline],
  [DocumentType.Exercises, IconAndroidStudio],
  [DocumentType.GradedExercises, IconStar],
  [DocumentType.Miscellaneous, IconDotsHorizontal],
  [DocumentType.Practical, IconTestTube],
  [DocumentType.PracticalExam, IconHammerWrench],
  [DocumentType.Summary, IconSigma],
]);

export const ORDER_DOCUMENT_TYPES: DocumentType[] = [
  DocumentType.Exam,
  DocumentType.Summary,
  DocumentType.CourseNotes,
  DocumentType.Exercises,
  DocumentType.GradedExercises,
  DocumentType.Practical,
  DocumentType.PracticalExam,
  DocumentType.CourseSlides,
  DocumentType.Miscellaneous,
];

export const ORDER_REACTIONS: string[] = ['👍', '👎', '👏', '😂', '😮', '😡', '❤️', '💀', '🎉'];

export function orderedDisplay<T extends string | number | symbol>(
  order: T[],
  display: Record<T, string>,
): Array<[T, string]> {
  return order.map((value) => [value, display[value]] as [T, string]);
}
