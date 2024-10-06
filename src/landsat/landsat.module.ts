import { Module } from '@nestjs/common';
import { LandsatService } from './landsat.service';
import { LandsatController } from './landsat.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [LandsatController],
  providers: [LandsatService],
})
export class LandsatModule {}
