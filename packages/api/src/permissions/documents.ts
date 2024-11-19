import type { Context } from '#lib';
import type { Document } from '@churros/db/prisma';

export function canSeeDocumentFiles(user: Context['user'], _document: Document) {
  if (!user) return false;
  if (user.admin) return true;
  if (!user.majorId) return false;
  return user.canAccessDocuments;
}
