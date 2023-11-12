import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	async onModuleInit() {
		await this.$connect();
	}
}

@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
