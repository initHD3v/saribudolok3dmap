import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegionModule } from './modules/region/region.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [RegionModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
