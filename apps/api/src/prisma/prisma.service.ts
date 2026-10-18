import {
  Injectable,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import path from "path";
import fs from "fs";

import { PrismaClient } from "@repo/db";

function configureQueryEnginePath() {
  if (process.env.PRISMA_QUERY_ENGINE_LIBRARY) return;

  const candidates = [
    path.join(__dirname, "libquery_engine-rhel-openssl-3.0.x.so.node"),
    path.join(process.cwd(), "apps/api/dist/libquery_engine-rhel-openssl-3.0.x.so.node"),
    path.join(process.cwd(), "dist/libquery_engine-rhel-openssl-3.0.x.so.node"),
    path.join(process.cwd(), "libquery_engine-rhel-openssl-3.0.x.so.node"),
    path.join(process.cwd(), "apps/api/libquery_engine-rhel-openssl-3.0.x.so.node"),
    path.join(__dirname, "..", "libquery_engine-rhel-openssl-3.0.x.so.node"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = candidate;
      console.log(`[PrismaService] Configured PRISMA_QUERY_ENGINE_LIBRARY: ${candidate}`);
      break;
    }
  }
}

configureQueryEnginePath();

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super(
      process.env.MONGODB_URI
        ? {
            datasources: {
              db: {
                url: process.env.MONGODB_URI,
              },
            },
          }
        : undefined,
    );
  }

  async onModuleInit() {
    if (!process.env.MONGODB_URI) {
      this.logger.error("MONGODB_URI is not defined in environment variables!");
    }
    try {
      await this.$connect();
      this.logger.log("Prisma successfully connected to database.");
    } catch (error: any) {
      this.logger.error(`Database connection error during onModuleInit: ${error?.message}`, error?.stack);
    }
  }
}