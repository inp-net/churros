import { Args, Query, Resolver } from '@nestjs/graphql';
import { School } from './models/school.model';
import { PrismaService } from 'src/database/prisma.service';

/**
 * Resolves school-related queries.
 */
@Resolver(() => School)
export class SchoolsResolver {
	constructor(private prisma: PrismaService) {}

	/**
	 * Gets a school by its UID.
	 * @param uid
	 * @throws {Error} if the school is not found
	 */
	@Query(() => School)
	async school(
		@Args('uid', { type: () => String }) uid: string,
	): Promise<School> {
		return this.prisma.school.findFirstOrThrow({
			where: { uid },
			include: {
				studentAssociations: true,
				services: {
					include: {
						group: true,
					},
				},
			},
		});
	}

	/**
	 * Gets all schools.
	 */
	@Query(() => [School])
	async schools(): Promise<School[]> {
		return this.prisma.school.findMany({ orderBy: { name: 'asc' } });
	}
}
