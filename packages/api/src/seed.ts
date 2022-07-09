import { CredentialType, PrismaClient } from '@prisma/client'
import { hash } from 'argon2'

const prisma = new PrismaClient()

// Users
const alice = await prisma.user.create({
  data: { name: 'alice', firstname: 'Alice', lastname: 'Wonderland' },
})
const bob = await prisma.user.create({
  data: { name: 'bob', firstname: 'Bob', lastname: 'Sponge' },
})
const charlie = await prisma.user.create({
  data: { name: 'charlie', firstname: 'Charlie', lastname: 'Ouest' },
})

// Credentials
await prisma.credential.createMany({
  data: [
    {
      type: CredentialType.Password,
      userId: alice.id,
      value: await hash('al1ce'),
    },
    {
      type: CredentialType.Password,
      userId: bob.id,
      value: await hash('b0b'),
    },
    {
      type: CredentialType.Password,
      userId: charlie.id,
      value: await hash('ch4rlie'),
    },
  ],
})

// Clubs
const football = await prisma.club.create({ data: { name: 'Football' } })
const rugby = await prisma.club.create({ data: { name: 'Rugby' } })

// Club members
await prisma.clubMember.createMany({
  data: [
    {
      memberId: alice.id,
      clubId: football.id,
      title: 'Présidente',
      president: true,
      canEditArticles: true,
    },
    {
      memberId: bob.id,
      clubId: football.id,
      title: 'Trésorier',
      treasurer: true,
      canEditMembers: true,
    },
    {
      memberId: charlie.id,
      clubId: rugby.id,
      title: 'Président',
      president: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      memberId: alice.id,
      clubId: rugby.id,
      title: 'Trésorière',
      treasurer: true,
    },
  ],
})

// Club articles
await prisma.article.createMany({
  data: [
    {
      authorId: alice.id,
      clubId: football.id,
      title: 'Reprise des entraînements en octobre',
      body: 'Hello **World**!',
      published: true,
    },
    {
      authorId: charlie.id,
      clubId: rugby.id,
      title: 'Toulouse a gagné',
      body: '_youpi_',
      published: true,
      homepage: true,
    },
  ],
})
