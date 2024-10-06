import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LandsatModule } from './landsat/landsat.module';
import { PositionModule } from './position/position.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { envs } from './config/envs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.db_host,
      port: Number(envs.db_port),
      database: envs.db_name,
      username: envs.db_user,
      password: envs.db_password,
      autoLoadEntities: true,
      synchronize: true,
    }),
    LandsatModule,
    PositionModule,
    ScheduleModule.forRoot(),
    UsersModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
