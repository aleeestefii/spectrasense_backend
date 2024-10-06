import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Between, getManager, Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
    private mailService: MailService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      await this.mailService.sendUserConfirmation(user.name, user.email);
      return user;
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  async findAll(
    latMin: number,
    latMax: number,
    lonMin: number,
    lonMax: number,
  ) {
    const users = await this.userRepository.findAndCount({
      where: {
        latitude: Between(latMin, latMax),
        longitude: Between(lonMin, lonMax),
      },
    });
    return users;
  }
}
