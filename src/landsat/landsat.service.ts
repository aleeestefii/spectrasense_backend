import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { catchError, map } from 'rxjs/operators';
import { envs } from 'src/config/envs';

@Injectable()
export class LandsatService {
  constructor(private readonly httpService: HttpService) {}

  private readonly baseUrl = 'https://m2m.cr.usgs.gov/api/api/json/stable/';
  private apiKey = envs.apiLandsat; // Obtén la API Key registrándote en la API de USGS

  async login(username: string, password: string): Promise<string> {
    const loginUrl = `${this.baseUrl}login`;

    const requestBody = {
      username,
      password,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(loginUrl, requestBody),
      );

      if (response.data && response.data.data) {
        this.apiKey = response.data.data; // Almacena la apiKey recibida
        return this.apiKey;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw new Error(`Error logging in: ${error.message}`);
    }
  }

  async searchDataset(datasetName: string, spatialFilter: any): Promise<any> {
    const searchUrl = `${this.baseUrl}dataset-search`;

    const requestBody = {
      apiKey: this.apiKey,
      datasetName,
      spatialFilter,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(searchUrl, requestBody),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Error searching dataset: ${error.message}`);
    }
  }
}
