import { type User, PrismaClient} from "@churros/db/prisma"


const prisma = new PrismaClient();

prisma.user.findMany().then((users: User[]) => {
  console.log(users);
});
