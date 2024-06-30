import { builder, log, markAsContributor, objectValuesFlat, prisma, purgeUserSessions } from '#lib';
import { DateTimeScalar, UIDScalar } from '#modules/global';
import { LinkInput } from '#modules/links';
import { userIsAdminOf } from '#permissions';
import { GraphQLError } from 'graphql';
import { phone as parsePhoneNumber } from 'phone';
import { UserType, requestEmailChange } from '../index.js';

/** Updates a user. */
builder.mutationField('updateUser', (t) =>
  t.prismaField({
    type: UserType,
    errors: {},
    args: {
      uid: t.arg({ type: UIDScalar }),
      firstName: t.arg.string(),
      lastName: t.arg.string(),
      majorId: t.arg.id({ required: false }),
      minorId: t.arg.id({ required: false }),
      graduationYear: t.arg.int({ required: false }),
      email: t.arg.string(),
      otherEmails: t.arg.stringList(),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      nickname: t.arg.string({ validate: { maxLength: 255 } }),
      description: t.arg.string({ validate: { maxLength: 10_000 } }),
      links: t.arg({ type: [LinkInput] }),
      cededImageRightsToTVn7: t.arg.boolean(),
      apprentice: t.arg.boolean(),
      godparentUid: t.arg.string({
        required: false,
        description:
          'An empty string removes the godparent. Passing null (or undefined) does not update the godparent. An uid sets the godparent to that uid.',
      }),
      contributesWith: t.arg({ type: ['ID'], required: false }),
    },
    async authScopes(_, { uid }, { user }) {
      const studentAssociationIds = objectValuesFlat(
        await prisma.user.findUniqueOrThrow({
          where: { id: user?.id },
          select: {
            major: {
              select: { schools: { select: { studentAssociations: { select: { id: true } } } } },
            },
          },
        }),
      );

      return userIsAdminOf(user, studentAssociationIds) || uid === user?.uid;
    },
    async resolve(
      query,
      _,
      {
        uid,
        majorId,
        minorId,
        email,
        otherEmails,
        graduationYear,
        nickname,
        description,
        links,
        address,
        phone,
        birthday,
        godparentUid,
        contributesWith,
        cededImageRightsToTVn7,
        apprentice,
        firstName,
        lastName,
      },
      { user },
    ) {
      if (!user) throw new GraphQLError('Connexion requise');
      const targetUser = await prisma.user.findUniqueOrThrow({
        where: { uid },
        include: {
          major: {
            select: { schools: { select: { studentAssociations: { select: { id: true } } } } },
          },
        },
      });

      const userIsAdmin = userIsAdminOf(user, objectValuesFlat(targetUser.major));

      if (phone) {
        const { isValid, phoneNumber } = parsePhoneNumber(phone, { country: 'FRA' });
        if (isValid) {
          phone = phoneNumber;
        } else {
          const { isValid, phoneNumber } = parsePhoneNumber(phone);
          if (!isValid) throw new Error('Numéro de téléphone invalide');
          phone = phoneNumber;
        }
      }

      const {
        email: oldEmail,
        graduationYear: oldGraduationYear,
        contributions: oldContributions,
      } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        include: { contributions: true },
      });

      const changingEmail = email !== oldEmail;
      const changingGraduationYear = graduationYear !== oldGraduationYear;
      let changingContributesWith = false;
      if (contributesWith) {
        changingContributesWith =
          JSON.stringify(
            oldContributions
              .filter((c) => c.paid)
              .map(({ optionId }) => optionId)
              .sort(),
          ) !== JSON.stringify(contributesWith.sort());
      }

      if (changingEmail) {
        // Check if new email is available
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new GraphQLError('Cet e-mail est déjà utilisé');
        // Delete all pending password resets for user
        await prisma.passwordReset.deleteMany({
          where: {
            user: {
              email: { in: [email, oldEmail] },
            },
          },
        });
        // Send a validation email
        await requestEmailChange(email, targetUser.id);
      }

      if (!userIsAdmin && changingGraduationYear)
        throw new GraphQLError('Demande au bureau de ton AE pour changer de promo');

      purgeUserSessions(uid);
      if (
        changingContributesWith &&
        contributesWith &&
        userIsAdminOf(user, objectValuesFlat(targetUser.major))
      ) {
        await prisma.contribution.deleteMany({
          where: {
            user: { uid },
            option: {
              id: {
                notIn: contributesWith,
              },
            },
          },
        });
        for (const optionId of contributesWith) {
          await prisma.contribution.upsert({
            where: { optionId_userId: { optionId, userId: targetUser.id } },
            update: {
              paid: true,
            },
            create: {
              option: { connect: { id: optionId } },
              user: { connect: { id: targetUser.id } },
              paid: true,
            },
          });
        }
      }

      const userUpdated = await prisma.user.update({
        ...query,
        where: { uid },
        data: {
          major: majorId ? { connect: { id: majorId } } : { disconnect: true },
          minor: minorId ? { connect: { id: minorId } } : { disconnect: true },
          graduationYear: graduationYear ?? undefined,
          nickname,
          description,
          address,
          phone,
          birthday,
          firstName: userIsAdmin ? firstName : targetUser.firstName,
          lastName: userIsAdmin ? lastName : targetUser.lastName,
          cededImageRightsToTVn7,
          apprentice,
          links: { deleteMany: {}, createMany: { data: links } },
          otherEmails: { set: otherEmails.filter(Boolean) },
          godparent:
            godparentUid === ''
              ? { disconnect: true }
              : godparentUid
                ? { connect: { uid: godparentUid } }
                : {},
        },
      });

      try {
        await markAsContributor(userUpdated.uid);
      } catch (error) {
        await log('ldap-sync', 'mark as contributor', { err: error }, userUpdated.uid);
      }

      await prisma.logEntry.create({
        data: {
          area: 'user',
          action: 'update',
          target: userUpdated.id,
          message: `Updated user ${userUpdated.uid}`,
          user: { connect: { id: user.id } },
        },
      });
      return userUpdated;
    },
  }),
);
