import {
  NotificationChannel,
  type DocumentType,
  type EventFrequency,
  type GroupType,
  type PaymentMethod,
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

export const DISPLAY_VISIBILITIES = {
  Public: 'Public',
  Restricted: 'Restreint au groupe',
  Unlisted: 'Non répertorié',
  Private: 'Privé',
};

export const HELP_VISIBILITY = {
  Public: 'Visible par tous',
  Restricted: 'Visible par les membres du groupe',
  Unlisted: 'Visible par tout ceux qui possèdent le lien',
  Private: 'Visible par personne (excepté les administrateurs et organisateurs)',
};

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
  Biweekly: 'Bimensuel',
  Monthly: 'Mensuel',
  Weekly: 'Hebdomadaire',
  Once: 'Une seule fois',
};

export const DISPLAY_DOCUMENT_TYPES: Record<DocumentType, string> = {
  CourseNotes: 'Notes de cours',
  CourseSlides: 'Diapositives du cours',
  Exam: 'Partiel',
  Exercises: 'TD',
  GradedExercises: 'DM',
  Miscellaneous: 'Autre',
  Practical: 'TP',
  PracticalExam: 'BE',
  Summary: 'Fiche',
};
