import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { envs } from 'src/config/envs';
import * as satellite from 'satellite.js';
import axios, { AxiosResponse } from 'axios';
import * as path from 'path';
import { exec } from 'child_process';
import Jimp from 'jimp';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class LandsatService {
  private readonly API_URL = 'https://m2m.cr.usgs.gov/api/api/json/stable';
  private readonly tleUrl = 'https://celestrak.com/NORAD/elements/resource.txt';
  private readonly logger = new Logger(LandsatService.name);
  private currentPosition: { latitude: number; longitude: number } | null =
    null;
  constructor(
    private readonly usersService: UsersService,
    private mailService: MailService,
  ) {}

  async getSatellitePosition(): Promise<{
    latitude: number;
    longitude: number;
  }> {
    try {
      const response = await axios.get(this.tleUrl);
      const tleData = this.parseTLE(response.data, 'LANDSAT 8');

      if (!tleData) {
        throw new Error('No TLE data found for Landsat 8');
      }

      const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);

      const now = new Date();
      const positionAndVelocity = satellite.propagate(satrec, now);

      if (positionAndVelocity.position === false) {
        throw new Error('Could not propagate satellite position');
      }

      const gmst = satellite.gstime(now);
      const geodetic = satellite.eciToGeodetic(
        positionAndVelocity.position as satellite.EciVec3<number>,
        gmst,
      );

      const latitude = satellite.degreesLat(geodetic.latitude);
      const longitude = satellite.degreesLong(geodetic.longitude);

      return {
        latitude,
        longitude,
      };
    } catch (error) {
      throw new Error(`Error fetching satellite position: ${error.message}`);
    }
  }

  private parseTLE(
    data: string,
    satelliteName: string,
  ): { line1: string; line2: string } | null {
    const lines = data.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(satelliteName)) {
        return {
          line1: lines[i + 1].trim(),
          line2: lines[i + 2].trim(),
        };
      }
    }
    return null;
  }

  getLandsatScene(
    latitude: number,
    longitude: number,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Definir la ruta del script de Python
      const scriptPath = path.join(__dirname, 'codes/datos.py');

      // Construir el comando para ejecutar el script con los argumentos
      let command = `python ${scriptPath} ${latitude} ${longitude}`;
      if (startDate) command += ` ${startDate}`;
      if (endDate) command += ` ${endDate}`;

      // Ejecutar el script de Python
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject({ error: stderr || 'Failed to execute Python script.' });
        } else {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (parseError) {
            reject({ error: 'Failed to parse Python script output.' });
          }
        }
      });
    });
  }

  async getLandsatImage(latitude: number, longitude: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Define la ruta del script Python
      const scriptPath = path.join(__dirname, 'codes/landsat.py');

      // Ejecuta el script con los argumentos de latitud y longitud
      const command = `python ${scriptPath} ${latitude} ${longitude} 100`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error ejecutando el script Python: ${stderr}`);
          reject('Error fetching Landsat data');
        } else {
          try {
            exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error ejecutando el script Python: ${stderr}`);
                reject('Error fetching Landsat data');
              } else {
                console.log('Python script output:', stdout); // Añade esta línea
                try {
                  const data = JSON.parse(stdout);
                  resolve(data);
                } catch (parseError) {
                  console.error('Error parsing Landsat data:', parseError);
                  reject('Error parsing Landsat data');
                }
              }
            });

            // Parsear la salida JSON del script
            const data = JSON.parse(stdout);

            // Convertir los valores de bandas espectrales a colores RGB
            const rgbData = data.features.map((feature: any) => {
              const properties = feature.properties;

              // Normaliza las bandas y convierte a un rango de 0-255
              const normalize = (value: number, min: number, max: number) =>
                Math.min(
                  255,
                  Math.max(0, Math.floor(((value - min) / (max - min)) * 255)),
                );

              // Define los valores mínimo y máximo para normalizar las bandas
              const minBandValue = 0;
              const maxBandValue = 20000;

              // Extrae los valores de las bandas y los normaliza
              const red = normalize(
                properties.SR_B4,
                minBandValue,
                maxBandValue,
              );
              const green = normalize(
                properties.SR_B3,
                minBandValue,
                maxBandValue,
              );
              const blue = normalize(
                properties.SR_B2,
                minBandValue,
                maxBandValue,
              );

              return {
                id: feature.id,
                rgb: `rgb(${red}, ${green}, ${blue})`,
              };
            });

            resolve(rgbData);
          } catch (parseError) {
            reject('Error parsing Landsat data');
          }
        }
      });
    });
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async updateSatellitePosition() {
    try {
      this.currentPosition = await this.getSatellitePosition();

      this.logger.log(
        `Updated satellite position: ${JSON.stringify(this.currentPosition)}`,
      );

      if (this.currentPosition) {
        const { latitude, longitude } = this.currentPosition;
        const [users, count] = await this.usersService.findAll(
          latitude - 3,
          latitude + 3,
          longitude - 3,
          longitude + 3,
        );

        if (count > 0) {
          for (const user of users) {
            await this.mailService.sendSateliteComming(
              user.name,
              user.email,
              latitude,
              longitude,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to update satellite position: ${error.message}`,
      );
    }
  }
}
