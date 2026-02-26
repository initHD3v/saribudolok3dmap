"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RegionService = class RegionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRegionDto) {
        const { name, code, level, geometry } = createRegionDto;
        const geoJsonString = JSON.stringify(geometry);
        try {
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
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to create region: ${error.message}`);
        }
    }
    async findAll() {
        const regions = await this.prisma.$queryRaw `
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
    async findOne(code) {
        const region = await this.prisma.$queryRaw `
      SELECT id, name, code, level, 
             ST_AsGeoJSON(geometry)::json as geometry,
             area_km2 
      FROM regions 
      WHERE code = ${code}
      LIMIT 1
    `;
        return region[0] || null;
    }
};
exports.RegionService = RegionService;
exports.RegionService = RegionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegionService);
//# sourceMappingURL=region.service.js.map