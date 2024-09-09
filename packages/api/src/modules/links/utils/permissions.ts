import type { Context } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { canEditArticle } from '#modules/posts';
import { canEditProfile } from '#modules/users';
import type { Prisma } from '@churros/db/prisma';

export const MAXIMUM_LINKS = 10;

export const canEditLinkPrismaIncludes = {
  Event: { include: canEditEventPrismaIncludes },
  Ticket: { include: { event: { include: canEditEventPrismaIncludes } } },
  Article: { include: canEditArticle.prismaIncludes },
  User: { include: canEditProfile.prismaIncludes },
} as const satisfies Prisma.LinkInclude;

export function canEditLink(
  user: Context['user'],
  link: Prisma.LinkGetPayload<{
    include: typeof canEditLinkPrismaIncludes;
  }>,
) {
  // Allow admins to act on links that are not linked to any resource (borked links)
  if (user?.admin) return true;
  if (link.Event) return canEditEvent(link.Event, user);
  if (link.Article) return canEditArticle(link.Article, link.Article, user);
  if (link.Ticket) return canEditEvent(link.Ticket.event, user);
  if (link.User) return canEditProfile(user, link.User);
  return false;
}
