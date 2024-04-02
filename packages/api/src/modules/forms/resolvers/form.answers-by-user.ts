import { builder, fullTextSearch, prisma } from '#lib';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { resolveArrayConnection, resolveOffsetConnection } from '@pothos/plugin-relay';
import type { Answer, User } from '@prisma/client';
import groupBy from 'lodash.groupby';
import { answerTypePrismaIncludes } from '../types/answer.js';
import { AnswersOfUserType } from '../types/answers-of-user.js';
import { FormType } from '../types/form.js';
import { canSeeAllAnswers } from '../utils/permissions.js';

builder.prismaObjectField(FormType, 'answersByUser', (t) =>
  t.connection({
    description:
      "Réponses au formulaire, groupées par utilisateur·ice. Ne contient pas de réponses dont l'utilisateur·ice est inconnu·e.",
    type: AnswersOfUserType,
    authScopes(form, {}, { user }) {
      return canSeeAllAnswers(form, form.event, user);
    },
    args: {
      q: t.arg.string({
        description: 'Recherche par utilisateur·ice',
        required: false,
      }),
    },
    async resolve(form, { q, ...connectionArgs }, context, info) {
      // this is not working, and pothos fails to include required fields for use in authScopes, the type system is tricked into thinking that they are properly included though.
      const query = queryFromInfo({
        context,
        info,
        path: ['answers'],
      });

      if (q) {
        const searchResults = await fullTextSearch('User', q, {
          property: 'user',
          resolveObjects: async (ids) =>
            prisma.user.findMany({
              where: { id: { in: ids } },
              include: {
                formAnswers: {
                  include: {
                    createdBy: true,
                    ...answerTypePrismaIncludes,
                  },
                  where: { question: { section: { formId: form.id } } },
                },
              },
            }),
          similarityCutoff: 0.08,
          fuzzy: ['firstName', 'lastName', 'nickname', 'email', 'uid', 'phone'],
          highlight: [],
          htmlHighlights: [],
        });

        return resolveArrayConnection(
          { args: connectionArgs },
          searchResults
            .filter(propertyIsNotNull('user'))
            .filter(({ user }) => user.formAnswers.length > 0)
            .map(({ user, user: { formAnswers } }) => ({
              user,
              answers: formAnswers.filter(propertyIsNotNull('createdBy')),
              date: new Date(Math.max(...formAnswers.map((a) => a.createdAt.valueOf()))),
            })),
        );
      }

      return resolveOffsetConnection({ args: connectionArgs }, async ({ limit, offset }) => {
        const answers = await prisma.answer.findMany({
          ...query,
          where: {
            createdById: { not: null },
            question: { section: { formId: form.id } },
          },
          orderBy: [{ createdById: 'desc' }],
          take: limit,
          skip: offset,
          include: {
            createdBy: true,
            ...answerTypePrismaIncludes,
          },
        });
        const result = groupAndSort(answers);
        return result;
      });
    },
  }),
);

function groupAndSort<T extends Answer & { createdBy: User | null }>(answers: T[]) {
  return Object.values(groupBy(answers.filter(propertyIsNotNull('createdBy')), 'createdById'))
    .map((answers) => ({
      user: answers[0]!.createdBy,
      answers,
      date: new Date(Math.max(...answers.map((a) => a.createdAt.valueOf()))),
    }))
    .sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

function propertyIsNotNull<T extends Record<string, unknown>, K extends keyof T>(property: K) {
  function _notNull(result: T): result is T & { [key in K]: NonNullable<T[K]> } {
    return result[property] != null;
  }
  return _notNull;
}
