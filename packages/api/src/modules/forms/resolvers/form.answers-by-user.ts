import { builder, fullTextSearch, prisma } from '#lib';
import type { Answer, User } from '@churros/db/prisma';
import { resolveArrayConnection, resolveOffsetConnection } from '@pothos/plugin-relay';
import groupBy from 'lodash.groupby';
import { answerTypePrismaIncludes } from '../types/answer.js';
import { FormType } from '../types/form.js';
import { AnswersOfUserType } from '../types/index.js';
import { canSeeAllAnswers } from '../utils/index.js';

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
    async resolve(form, { q, ...connectionArgs }) {
      if (q) {
        const searchResults = await fullTextSearch('User', q, {
          property: 'user',
          resolveObjects: async (ids) =>
            prisma.user.findMany({
              where: { id: { in: ids } },
              include: {
                adminOfStudentAssociations: true,
                canEditGroups: true,
                formAnswers: {
                  include: {
                    createdBy: {
                      include: { adminOfStudentAssociations: true, canEditGroups: true },
                    },
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
              date: new Date(Math.max(...formAnswers.map((a) => a.updatedAt.valueOf()))),
            })),
        );
      }

      return await resolveOffsetConnection({ args: connectionArgs }, async ({ limit, offset }) => {
        const answers = await prisma.answer.findMany({
          where: {
            createdById: { not: null },
            question: { section: { formId: form.id } },
          },
          orderBy: [{ createdById: 'desc' }],
          take: limit,
          skip: offset,
          include: {
            createdBy: {
              include: {
                adminOfStudentAssociations: true,
                canEditGroups: true,
              },
            },
            ...answerTypePrismaIncludes,
          },
        });
        return groupAndSort(answers);
      });
    },
  }),
);

function groupAndSort<T extends Answer & { createdBy: User | null }>(answers: T[]) {
  return Object.values(groupBy(answers.filter(propertyIsNotNull('createdBy')), 'createdById'))
    .map((answers) => ({
      user: answers[0]!.createdBy,
      answers,
      date: new Date(Math.max(...answers.map((a) => a.updatedAt.valueOf()))),
    }))
    .sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

function propertyIsNotNull<T extends Record<string, unknown>, K extends keyof T>(property: K) {
  function _notNull(result: T): result is T & { [key in K]: NonNullable<T[K]> } {
    return result[property] != null;
  }
  return _notNull;
}
