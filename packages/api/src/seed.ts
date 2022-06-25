import { CredentialType, PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

// Users
const alice = await prisma.user.create({
  data: { name: "alice", firstname: "Alice", lastname: "Wonderland" },
});
const bob = await prisma.user.create({
  data: { name: "bob", firstname: "Bob", lastname: "Sponge" },
});
const charlie = await prisma.user.create({
  data: { name: "charlie", firstname: "Charlie", lastname: "Ouest" },
});

// Credentials
await prisma.credential.createMany({
  data: [
    {
      type: CredentialType.Password,
      userId: alice.id,
      value: await argon2.hash("al1ce", { type: argon2.argon2id }),
    },
    {
      type: CredentialType.Password,
      userId: bob.id,
      value: await argon2.hash("b0b", { type: argon2.argon2id }),
    },
    {
      type: CredentialType.Password,
      userId: charlie.id,
      value: await argon2.hash("ch4rlie", { type: argon2.argon2id }),
    },
  ],
});

// Clubs
const football = await prisma.club.create({ data: { name: "Football" } });
const rugby = await prisma.club.create({ data: { name: "Rugby" } });

// Club members
await prisma.clubMember.createMany({
  data: [
    { memberId: alice.id, clubId: football.id, president: true },
    { memberId: bob.id, clubId: football.id, treasurer: true },
    { memberId: charlie.id, clubId: rugby.id, president: true },
    { memberId: alice.id, clubId: rugby.id, treasurer: true },
  ],
});
