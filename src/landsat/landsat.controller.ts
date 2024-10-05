import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { LandsatService } from './landsat.service';

@Controller('landsat')
export class LandsatController {
  constructor(private readonly landsatService: LandsatService) {}

  @Get('position')
  async getSatellitePosition() {
    return await this.landsatService.getSatellitePosition();
  }

  @Get('image')
  async getLandsatImage(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    return await this.landsatService.getLandsatImage(latitude, longitude);
  }

}
