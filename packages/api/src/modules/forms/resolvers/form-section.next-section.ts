import { builder, prisma } from '#lib';
import { FormSectionType } from '../types/form-section.js';

builder.prismaObjectField(FormSectionType, 'nextSection', (t) =>
  t.prismaField({
    type: FormSectionType,
    nullable: true,
    description:
      "Section suivante dans le formulaire, si il y en a une. (Sinon, c'est que c'est la dernière section). Dépend du fait que des sections soit cachées à l'utilisateur (voir `restrictedToGroups`), ou que une répond à une question provoque le passaage à une autre section (voir `goToSection`) ",
    async resolve(query, { id: sectionId, order, formId }, {}, { user }) {
      const sections = await prisma.formSection.findMany({
        ...query,
        where: {
          formId,
          // OR: [
          //   {
          //     restrictedToGroups: {
          //       some: {
          //         members: {
          //           some: {
          //             memberId: user?.id,
          //           },
          //         },
          //       },
          //     },
          //   },
          //   {
          //     restrictedToGroups: {
          //       none: {},
          //     },
          //   },
          // ],
          order: {
            gt: order,
          },
        },
        orderBy: {
          order: 'asc',
        },
      });

      const nextSection = sections[0] ?? null;

      // FIXME cannot have conditional sections for forms that don't require logging in with this
      if (!user) return nextSection;

      const answersForThisSectionWithJumps = await prisma.answer.findMany({
        where: {
          question: {
            sectionId,
            jumps: {
              some: {},
            },
          },
          createdById: user?.id,
        },
        include: {
          question: {
            include: {
              jumps: {
                include: {
                  target: true,
                },
              },
            },
          },
        },
      });

      // Check if any of the answers by the user makes them jump to another section
      const jumpCandidates = answersForThisSectionWithJumps
        .map(({ answer, question: { jumps } }) => {
          if (answer.length === 0) return null;
          return jumps.find((jump) => jump.value === answer[0]!);
        })
        .filter(Boolean)
        .sort((a, b) => a!.target.order - b!.target.order);

      if (jumpCandidates.length > 0) {
        return prisma.formSection.findUnique({
          ...query,
          where: {
            id: jumpCandidates[0]!.target.id,
          },
        });
      }

      return nextSection;
    },
  }),
);
