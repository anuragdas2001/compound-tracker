import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
  } from "@nestjs/common";
  
  import { UsersService } from "./users.service";
  
  @Controller("users")
  export class UsersController {
    constructor(
      private readonly usersService: UsersService,
    ) {}
  
  
    @Get()
    async findAll() {
      return this.usersService.findAll();
    }
  
    @Get(":id")
    async findOne(
      @Param("id") id: string,
    ) {
      return this.usersService.findById(id);
    }
  
    @Delete(":id")
    async delete(
      @Param("id") id: string,
    ) {
      return this.usersService.delete(id);
    }
  }