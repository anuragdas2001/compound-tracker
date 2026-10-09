import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    let summary = await this.prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!summary) {
      // Ensure user exists before creating gamification record
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        // Mock user or handle gracefully based on how the DB is seeded
        return { totalXp: 0, level: 1, sparksBalance: 150 };
      }

      summary = await this.prisma.userGamification.create({
        data: {
          userId,
          totalXp: 0,
          level: 1,
          sparksBalance: 150,
        },
      });
    }

    return summary;
  }
}
