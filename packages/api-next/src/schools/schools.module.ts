import { Module } from '@nestjs/common';
import { SchoolsResolver } from './schools.resolver';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
	imports: [PrismaModule],
	providers: [SchoolsResolver],
})
export class SchoolsModule {}
