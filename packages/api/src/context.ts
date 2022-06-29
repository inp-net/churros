import { YogaInitialContext } from "@graphql-yoga/node";
import { CredentialType } from "@prisma/client";
import { prisma } from "./prisma.js";

const getUser = async ({ headers }: Request) => {
  const auth = headers.get("Authorization");
  if (!auth) return null;
  const token = auth.slice("Bearer ".length);
  return prisma.credential
    .findFirst({ where: { type: CredentialType.Token, value: token } })
    .user({
      include: {
        clubs: {
          select: {
            clubId: true,
            canEditMembers: true,
            canEditArticles: true,
          },
        },
      },
    });
};

export type Context = YogaInitialContext & Awaited<ReturnType<typeof context>>;

export const context = async ({ request }: YogaInitialContext) => ({
  user: await getUser(request),
});
