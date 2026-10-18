import {
    ConflictException,
    Injectable,
    UnauthorizedException,
  } from "@nestjs/common";
  
  import * as bcrypt from "bcryptjs";
  
  import { JwtService } from "@nestjs/jwt";
  
  import { PrismaService } from "../prisma/prisma.service";
  import { UsersService } from "../users/users.service";
  
  import {
    LoginDto,
    RegisterDto,
  } from "@repo/api";

  @Injectable()
  export class AuthService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
    ) {}
  
    async register(dto: RegisterDto) {
      const existing =
        await this.usersService.findByEmail(
          dto.email,
        );
  
      if (existing) {
        throw new ConflictException(
          "User already exists",
        );
      }
  
      const passwordHash =
        await bcrypt.hash(dto.password, 10);
  
      const user =
        await this.prisma.user.create({
          data: {
            email: dto.email,
            password: passwordHash
          },
        });
  
      const accessToken =
        await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
        });
  
      return {
        user,
        accessToken,
      };
    }
  
    async login(dto: LoginDto) {
      const user =
        await this.usersService.findByEmail(
          dto.email,
        );
  
      if (!user || !user.password) {
        throw new UnauthorizedException(
          "Invalid credentials",
        );
      }
  
      const valid =
        await bcrypt.compare(
          dto.password,
          user.password,
        );
  
      if (!valid) {
        throw new UnauthorizedException(
          "Invalid credentials",
        );
      }
  
      const accessToken =
        await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
        });
  
      return {
        user,
        accessToken,
      };
    }
  
    async validateUser(userId: string) {
      return this.usersService.findById(userId);
    }
  }