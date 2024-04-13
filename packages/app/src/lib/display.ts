import type { DocumentType$options, Visibility$options } from '$houdini';
import {
  DocumentType,
  IssueState,
  NotificationChannel,
  Visibility,
  type EventFrequency,
  type GroupType,
  type PaymentMethod,
} from '$lib/zeus';
import type { SvelteComponent } from 'svelte';
import IconGroupMembers from '~icons/mdi/account-group-outline';
import IconGodparent from '~icons/mdi/account-multiple-outline';
import IconAndroidStudio from '~icons/mdi/android-studio';
import IconBankTransfer from '~icons/mdi/bank';
import IconNotification from '~icons/mdi/bell-outline';
import IconCalendarEndOutline from '~icons/mdi/calendar-end-outline';
import IconPaymentCheck from '~icons/mdi/checkbook';
import IconComment from '~icons/mdi/comment-outline';
import IconCreditCard from '~icons/mdi/credit-card-outline';
import {
  default as IconDotsHorizontal,
  default as IconQuestionMark,
} from '~icons/mdi/dots-horizontal';
import IconFileDocumentOutline from '~icons/mdi/file-document-outline';
import IconHammerWrench from '~icons/mdi/hammer-wrench';
import IconCash from '~icons/mdi/hand-coin-outline';
import IconArticle from '~icons/mdi/note-text-outline';
import IconShotgun from '~icons/mdi/pistol';
import IconPlayBoxOutline from '~icons/mdi/play-box-outline';
import IconPermissions from '~icons/mdi/shield-account-outline';
import IconSigma from '~icons/mdi/sigma';
import IconStar from '~icons/mdi/star-outline';
import IconTestTube from '~icons/mdi/test-tube';
import LogoLydia from '~icons/simple-icons/lydia';
import LogoPaypal from '~icons/simple-icons/paypal';

export const DISPLAY_PAYMENT_METHODS: Record<PaymentMethod, string> = {
  Cash: 'Espèces',
  Check: 'Chèque',
  Card: 'Carte bancaire',
  Transfer: 'Virement',
  Lydia: 'Lydia',
  Other: 'Autre',
  PayPal: 'PayPal',
};

export const ORDER_VISIBILITIES: Visibility[] = [
  Visibility.Public,
  Visibility.SchoolRestricted,
  Visibility.GroupRestricted,
  Visibility.Unlisted,
  Visibility.Private,
];

export const DISPLAY_VISIBILITIES: Record<Visibility | Visibility$options, string> = {
  Public: 'Public',
  GroupRestricted: 'Groupe',
  SchoolRestricted: 'École',
  Unlisted: 'Non répertorié',
  Private: 'Privé',
};

export const HELP_VISIBILITY: Record<Visibility | Visibility$options, string> = {
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
  PayPal: LogoPaypal,
};

export const DISPLAY_EVENT_FREQUENCY: Record<EventFrequency, string> = {
  Biweekly: 'Une semaine sur deux',
  Monthly: 'Mensuel',
  Weekly: 'Hebdomadaire',
  Once: 'Une seule fois',
};

export function documentType(key: string): DocumentType {
  switch (key) {
    case 'CourseNotes': {
      return DocumentType.CourseNotes;
    }

    case 'CourseSlides': {
      return DocumentType.CourseSlides;
    }

    case 'Exam': {
      return DocumentType.Exam;
    }

    case 'Exercises': {
      return DocumentType.Exercises;
    }

    case 'GradedExercises': {
      return DocumentType.GradedExercises;
    }

    case 'Miscellaneous': {
      return DocumentType.Miscellaneous;
    }

    case 'Practical': {
      return DocumentType.Practical;
    }

    case 'PracticalExam': {
      return DocumentType.PracticalExam;
    }

    case 'Summary': {
      return DocumentType.Summary;
    }
  }

  throw new Error(`Unknown document type: ${key}`);
}

export const DISPLAY_DOCUMENT_TYPES = new Map<DocumentType | DocumentType$options, string>([
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

export const ICONS_DOCUMENT_TYPES = new Map<
  DocumentType | DocumentType$options,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof SvelteComponent<any>
>([
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

export const ORDER_REACTIONS = ['❤️', '👍', '👎', '😂', '😮', '😡', '💀', '🎉'] as const;

// export const ICONS_REACTIONS: Record<typeof ORDER_REACTIONS[number], {outlined: SvelteComponent<any>, filled: SvelteComponent<any>} > = {
//   '❤️': {
//     filled: IconHeart,
//     outlined:
//   }
// }

export const ISSUE_STATE_DISPLAY = new Map<IssueState, string>([
  [IssueState.Closed, 'Terminé'],
  [IssueState.Open, 'En cours'],
  [IssueState.Deployed, 'En ligne'],
]);

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
