import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { envs } from 'src/config/envs';
import * as satellite from 'satellite.js';
import axios from 'axios';

@Injectable()
export class LandsatService {
  constructor(private readonly httpService: HttpService) {}

  private readonly tleUrl = 'https://celestrak.com/NORAD/elements/resource.txt';

  async getSatellitePosition(): Promise<{
    latitude: number;
    longitude: number;
  }> {
    try {
      // Obtener los datos TLE del satélite
      const response = await axios.get(this.tleUrl);
      const tleData = this.parseTLE(response.data, 'LANDSAT 8');

      if (!tleData) {
        throw new Error('No TLE data found for Landsat 8');
      }

      // Convertir los datos TLE a un objeto Satrec
      const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);

      // Obtener el tiempo actual en formato de date
      const now = new Date();
      const positionAndVelocity = satellite.propagate(satrec, now);

      if (positionAndVelocity.position === false) {
        throw new Error('Could not propagate satellite position');
      }

      // Convertir de ECI (Earth-Centered Inertial) a geodésicas (latitud, longitud, altura)
      const gmst = satellite.gstime(now);
      const geodetic = satellite.eciToGeodetic(
        positionAndVelocity.position as satellite.EciVec3<number>,
        gmst,
      );

      // Convertir latitud y longitud de radianes a grados
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
}
