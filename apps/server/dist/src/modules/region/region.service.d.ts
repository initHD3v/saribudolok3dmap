import { PrismaService } from '../../prisma/prisma.service';
export declare class RegionService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRegionDto: any): Promise<number>;
    findAll(): Promise<{
        type: string;
        features: {
            type: string;
            properties: {
                id: any;
                name: any;
                code: any;
                level: any;
                area_km2: any;
            };
            geometry: any;
        }[];
    }>;
    findOne(code: string): Promise<any>;
}
