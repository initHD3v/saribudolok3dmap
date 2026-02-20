import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RegionService } from './region.service';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  create(@Body() createRegionDto: any) {
    return this.regionService.create(createRegionDto);
  }

  @Get()
  findAll() {
    return this.regionService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.regionService.findOne(code);
  }
}
