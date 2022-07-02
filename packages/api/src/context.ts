import { GraphQLYogaError, YogaInitialContext } from "@graphql-yoga/node";
import { CredentialType } from "@prisma/client";
import { prisma } from "./prisma.js";

const getToken = ({ headers }: Request) => {
  const auth = headers.get("Authorization");
  if (!auth) return null;
  return auth.slice("Bearer ".length);
};

const getUser = async (token: string) => {
  const credential = await prisma.credential.findFirstOrThrow({
    where: { type: CredentialType.Token, value: token },
    include: { user: { include: { clubs: true } } },
  });

  // If the session expired, delete it
  if (credential.expiresAt !== null && credential.expiresAt < new Date()) {
    await prisma.credential.delete({ where: { id: credential.id } });
    throw new GraphQLYogaError("Session expired");
  }

  // Delete expired sessions once in a while
  if (Math.random() < 0.01) {
    await prisma.credential.deleteMany({
      where: { type: CredentialType.Token, expiresAt: { lt: new Date() } },
    });
  }

  const { user } = credential;

  // Normalize permissions
  user.canEditClubs ||= user.admin;
  user.canEditUsers ||= user.admin;

  return user;
};

export type Context = YogaInitialContext & Awaited<ReturnType<typeof context>>;

export const context = async ({ request }: YogaInitialContext) => {
  const token = getToken(request);
  if (!token) return {};
  return { token, user: await getUser(token) };
};
