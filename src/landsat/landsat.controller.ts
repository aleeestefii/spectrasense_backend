import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LandsatService } from './landsat.service';

@Controller('landsat')
export class LandsatController {
  constructor(private readonly landsatService: LandsatService) {}
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    return await this.landsatService.login(username, password);
  }

  @Post('search')
  async searchDataset(
    @Body() body: { datasetName: string; spatialFilter: any },
  ) {
    const { datasetName, spatialFilter } = body;
    return await this.landsatService.searchDataset(datasetName, spatialFilter);
  }
}
