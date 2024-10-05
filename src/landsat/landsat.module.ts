import { Module } from '@nestjs/common';
import { LandsatService } from './landsat.service';
import { LandsatController } from './landsat.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [LandsatController],
  providers: [LandsatService],
})
export class LandsatModule {}
