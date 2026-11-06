import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdateSettingsDto } from '@repo/api';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        gamification: true,
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const dataToUpdate: any = {};
    if (dto.name !== undefined) dataToUpdate.name = dto.name;
    if (dto.image !== undefined) dataToUpdate.image = dto.image;

    if (dto.newPassword) {
      if (user.password) {
        if (!dto.currentPassword) {
          throw new BadRequestException('Current password is required to change password.');
        }
        const matches = bcrypt.compareSync(dto.currentPassword, user.password);
        if (!matches) {
          throw new BadRequestException('Current password does not match.');
        }
      }
      dataToUpdate.password = bcrypt.hashSync(dto.newPassword, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        dayCutoffHour: true,
        updatedAt: true,
      },
    });
  }

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let settings = await this.prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          emailStreakReminder: true,
          emailWeeklyDigest: true,
          isPublicProfile: true,
          timezone: 'UTC',
        },
      });
    }

    return {
      ...settings,
      dayCutoffHour: user.dayCutoffHour,
    };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const settingsData: any = {};
    if (dto.emailStreakReminder !== undefined) settingsData.emailStreakReminder = dto.emailStreakReminder;
    if (dto.emailWeeklyDigest !== undefined) settingsData.emailWeeklyDigest = dto.emailWeeklyDigest;
    if (dto.isPublicProfile !== undefined) settingsData.isPublicProfile = dto.isPublicProfile;
    if (dto.timezone !== undefined) settingsData.timezone = dto.timezone;

    const [updatedSettings] = await Promise.all([
      this.prisma.userSettings.upsert({
        where: { userId },
        create: {
          userId,
          emailStreakReminder: dto.emailStreakReminder ?? true,
          emailWeeklyDigest: dto.emailWeeklyDigest ?? true,
          isPublicProfile: dto.isPublicProfile ?? true,
          timezone: dto.timezone ?? 'UTC',
        },
        update: settingsData,
      }),
      dto.dayCutoffHour !== undefined
        ? this.prisma.user.update({
            where: { id: userId },
            data: { dayCutoffHour: dto.dayCutoffHour },
          })
        : Promise.resolve(null),
    ]);

    return {
      ...updatedSettings,
      dayCutoffHour: dto.dayCutoffHour ?? user.dayCutoffHour,
    };
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
        status: 'ACCEPTED',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, gamification: true },
        },
        friend: {
          select: { id: true, name: true, email: true, image: true, gamification: true },
        },
      },
    });

    return friendships.map((f) => {
      const isOtherUser = f.userId === userId ? f.friend : f.user;
      return {
        friendshipId: f.id,
        id: isOtherUser.id,
        name: isOtherUser.name || isOtherUser.email?.split('@')[0] || 'Friend',
        email: isOtherUser.email,
        image: isOtherUser.image,
        level: isOtherUser.gamification?.level || 1,
        totalXp: isOtherUser.gamification?.totalXp || 0,
        sparks: isOtherUser.gamification?.sparksBalance || 150,
      };
    });
  }

  async addFriend(userId: string, friendEmailOrUsername: string) {
    const query = friendEmailOrUsername.trim().replace(/^@/, '');
    const friend = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: query },
          { name: query },
          { id: query.length === 24 ? query : undefined },
        ],
      },
    });

    if (!friend) {
      throw new NotFoundException(`No user found matching "${friendEmailOrUsername}".`);
    }

    if (friend.id === userId) {
      throw new BadRequestException('You cannot add yourself as a friend.');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: friend.id },
          { userId: friend.id, friendId: userId },
        ],
      },
    });

    if (existing) {
      return { success: true, message: 'You are already connected with this user.' };
    }

    await this.prisma.friendship.create({
      data: {
        userId,
        friendId: friend.id,
        status: 'ACCEPTED',
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: friend.id,
        type: 'NEW_FRIEND',
        title: 'New Friend Connected! 👥',
        body: `A fellow habit builder connected with you on Compound!`,
      },
    });

    return {
      success: true,
      message: `Successfully connected with ${friend.name || friend.email}!`,
    };
  }

  async removeFriend(userId: string, friendId: string) {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    return { success: true, message: 'Friend removed successfully.' };
  }

  async getPublicProfile(usernameOrId: string) {
    const query = usernameOrId.trim().replace(/^@/, '');
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: query.length === 24 ? query : undefined },
          { email: { startsWith: query } },
          { name: query },
        ],
      },
      include: {
        gamification: true,
        settings: true,
        habits: {
          where: { archived: false },
          select: { id: true, title: true, logs: true },
        },
        achievements: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    const isPublic = user.settings?.isPublicProfile ?? true;
    if (!isPublic) {
      return {
        id: user.id,
        name: user.name || 'Anonymous User',
        image: user.image,
        isPrivate: true,
        message: 'This user profile is private.',
      };
    }

    const totalLogs = user.habits.reduce((acc, h) => acc + (h.logs?.length || 0), 0);

    return {
      id: user.id,
      name: user.name || user.email?.split('@')[0] || 'Habit Builder',
      emailPrefix: user.email ? '@' + user.email.split('@')[0] : null,
      image: user.image,
      isPrivate: false,
      level: user.gamification?.level || 1,
      totalXp: user.gamification?.totalXp || 0,
      sparks: user.gamification?.sparksBalance || 150,
      totalHabits: user.habits.length,
      totalCheckIns: totalLogs,
      achievementsCount: user.achievements.length,
      achievements: user.achievements.map((a) => ({
        key: a.achievementKey,
        title: a.title,
        description: a.description,
        unlockedAt: a.unlockedAt,
      })),
      joinedAt: user.createdAt,
    };
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
