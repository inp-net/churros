import { YogaInitialContext } from "@graphql-yoga/node";
import { CredentialType } from "@prisma/client";
import { prisma } from "./prisma.js";

const getToken = ({ headers }: Request) => {
  const auth = headers.get("Authorization");
  if (!auth) return null;
  return auth.slice("Bearer ".length);
};

const getUser = async (token: string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      credentials: { some: { type: CredentialType.Token, value: token } },
    },
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
