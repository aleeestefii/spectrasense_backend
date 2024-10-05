import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LandsatModule } from './landsat/landsat.module';

@Module({
  imports: [LandsatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
