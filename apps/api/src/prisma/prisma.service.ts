import {
    Injectable,
    OnModuleInit,
  } from "@nestjs/common";
  
  import { PrismaClient } from "@repo/db";
  
  @Injectable()
  export class PrismaService
    extends PrismaClient
    implements OnModuleInit
  {
    async onModuleInit() {
      try {
        await this.$connect();
      } catch (error) {
        console.error('[PrismaService] Database connection error during onModuleInit:', error);
      }
    }
  }