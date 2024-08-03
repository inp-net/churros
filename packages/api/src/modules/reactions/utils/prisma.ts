import { splitID } from '#lib';
import type { Prisma } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';

export function whereClause({
  id,
  emoji,
  authorId,
}: {
  id: string;
  emoji: string;
  authorId: string;
}) {
  switch (splitID(id)[0]) {
    case 'Document': {
      return { emoji_authorId_articleId: { emoji, authorId, articleId: id } };
    }
    case 'Article': {
      return { emoji_authorId_articleId: { emoji, authorId, articleId: id } };
    }
    case 'Comment': {
      return { emoji_authorId_commentId: { emoji, authorId, commentId: id } };
    }
    case 'Event': {
      return { emoji_authorId_eventId: { emoji, authorId, eventId: id } };
    }
    default: {
      throw new GraphQLError(`Impossible de réagir sur une ressource de type ${splitID(id)[0]}`);
    }
  }
}

export function connection(id: string): Omit<Prisma.ReactionCreateInput, 'emoji' | 'authorId'> {
  switch (splitID(id)[0]) {
    case 'Document': {
      return { document: { connect: { id } } };
    }
    case 'Article': {
      return { article: { connect: { id } } };
    }
    case 'Comment': {
      return { comment: { connect: { id } } };
    }
    case 'Event': {
      return { event: { connect: { id } } };
    }
    default: {
      throw new GraphQLError(`Impossible de réagir sur une ressource de type ${splitID(id)[0]}`);
    }
  }
}
