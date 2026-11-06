import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateSettingsDto, FriendRequestDto } from '@repo/api';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile/public/:usernameOrId')
  async getPublicProfile(@Param('usernameOrId') usernameOrId: string) {
    return this.usersService.getPublicProfile(usernameOrId);
  }

  @Get('settings')
  async getSettings(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.usersService.getSettings(userId);
  }

  @Patch('settings')
  async updateSettings(
    @Query('userId') userId: string,
    @Body() dto: UpdateSettingsDto
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.usersService.updateSettings(userId, dto);
  }

  @Get('friends')
  async getFriends(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.usersService.getFriends(userId);
  }

  @Post('friends')
  async addFriend(
    @Query('userId') userId: string,
    @Body() dto: FriendRequestDto
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.usersService.addFriend(userId, dto.friendEmailOrUsername);
  }

  @Delete('friends/:friendId')
  async removeFriend(
    @Query('userId') userId: string,
    @Param('friendId') friendId: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.usersService.removeFriend(userId, friendId);
  }

  @Patch(':id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
