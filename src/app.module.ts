import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LandsatModule } from './landsat/landsat.module';
import { PositionModule } from './position/position.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [LandsatModule, PositionModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
