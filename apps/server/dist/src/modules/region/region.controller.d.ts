import { RegionService } from './region.service';
export declare class RegionController {
    private readonly regionService;
    constructor(regionService: RegionService);
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
