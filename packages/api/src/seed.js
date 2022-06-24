import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const seed = async () => {
  await prisma.user.create({ data: { name: "Alice" } });
  await prisma.user.create({ data: { name: "Bob" } });
  await prisma.user.create({ data: { name: "Charlie" } });
  await prisma.club.create({
    data: { name: "Football", members: { connect: [{ id: 1 }, { id: 2 }] } },
  });
  await prisma.club.create({
    data: { name: "Rugby", members: { connect: [{ id: 1 }, { id: 3 }] } },
  });
};

void seed();
