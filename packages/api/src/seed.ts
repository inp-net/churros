import { CredentialType, PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

await prisma.user.createMany({
  data: [
    { name: "alice", firstname: "Alice", lastname: "Wonderland" },
    { name: "bob", firstname: "Bob", lastname: "Sponge" },
    { name: "charlie", firstname: "Charlie", lastname: "Ouest" },
  ],
});
await prisma.credential.createMany({
  data: [
    {
      type: CredentialType.Password,
      userId: 1,
      value: await argon2.hash("al1ce", { type: argon2.argon2id }),
    },
    {
      type: CredentialType.Password,
      userId: 2,
      value: await argon2.hash("b0b", { type: argon2.argon2id }),
    },
    {
      type: CredentialType.Password,
      userId: 3,
      value: await argon2.hash("ch4rlie", { type: argon2.argon2id }),
    },
  ],
});
await prisma.club.create({
  data: { name: "Football", members: { connect: [{ id: 1 }, { id: 2 }] } },
});
await prisma.club.create({
  data: { name: "Rugby", members: { connect: [{ id: 1 }, { id: 3 }] } },
});
