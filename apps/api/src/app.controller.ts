import { Controller, Get, Optional } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    let dbStatus = 'skipped';
    let dbError: any = null;

    if (this.prisma) {
      try {
        await this.prisma.user.count();
        dbStatus = 'connected';
      } catch (err: any) {
        dbStatus = 'disconnected';
        dbError = {
          name: err?.name,
          message: err?.message,
        };
      }
    }

    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        error: dbError,
        hasMongoUri: !!process.env.MONGODB_URI,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
      },
    };
  }
}
