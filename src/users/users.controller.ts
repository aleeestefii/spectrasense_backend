import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':latitude/:longitude')
  findAll(
    @Param('latitude') latitude: number,
    @Param('longitude') longitude: number,
  ) {
    return this.usersService.findAll(
      (latitude - 3),
      (latitude + 3),
      (longitude - 3),
      (longitude + 3),
    );
  }
  
}
