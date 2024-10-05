import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { LandsatService } from './landsat.service';
import { Response } from 'express';

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

  @Get('scene')
  async getLandsatScene(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Latitude and longitude must be valid numbers.',
        });
      }

      const data = await this.landsatService.getLandsatScene(
        lat,
        lon,
        startDate,
        endDate,
      );
      return res.status(HttpStatus.OK).json(data);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}
