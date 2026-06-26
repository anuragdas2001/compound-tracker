import { Module } from '@nestjs/common';

import { LinksModule } from './links/links.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersService } from './users/users.service';
import { HabitsModule } from './habits/habits.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [LinksModule, UsersModule, HabitsModule, PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, UsersService],
})
export class AppModule {}
