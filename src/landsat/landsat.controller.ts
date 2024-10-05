import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LandsatService } from './landsat.service';

@Controller('landsat')
export class LandsatController {
  constructor(private readonly landsatService: LandsatService) {}

  @Get('position')
  async getSatellitePosition() {
    return await this.landsatService.getSatellitePosition();
  }
}
