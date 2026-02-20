import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  async create(createRegionDto: any) {
    const { name, code, level, geometry } = createRegionDto;
    const geoJsonString = JSON.stringify(geometry);

    try {
      // Menggunakan query raw untuk insert geometri PostGIS
      return await this.prisma.$executeRawUnsafe(`
        INSERT INTO regions (id, name, code, level, geometry, updated_at)
        VALUES (
          gen_random_uuid(), 
          '${name}', 
          '${code}', 
          '${level}', 
          ST_GeomFromGeoJSON('${geoJsonString}'),
          NOW()
        )
      `);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create region: ${error.message}`);
    }
  }

  async findAll() {
    // Mengambil data dan men-convert geometri PostGIS kembali ke GeoJSON
    const regions: any[] = await this.prisma.$queryRaw`
      SELECT id, name, code, level, 
             ST_AsGeoJSON(geometry)::json as geometry,
             area_km2, created_at 
      FROM regions
    `;
    
    return {
      type: 'FeatureCollection',
      features: regions.map(r => ({
        type: 'Feature',
        properties: {
          id: r.id,
          name: r.name,
          code: r.code,
          level: r.level,
          area_km2: r.area_km2
        },
        geometry: r.geometry
      }))
    };
  }

  async findOne(code: string) {
    const region: any[] = await this.prisma.$queryRaw`
      SELECT id, name, code, level, 
             ST_AsGeoJSON(geometry)::json as geometry,
             area_km2 
      FROM regions 
      WHERE code = ${code}
      LIMIT 1
    `;
    return region[0] || null;
  }
}
