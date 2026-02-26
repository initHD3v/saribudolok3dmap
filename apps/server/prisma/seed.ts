import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const geojsonPath = path.resolve(__dirname, '../../../geosjon/saribu_dolok_12.08.25.1012.geojson');
  const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

  const { name, code, level } = data.properties;
  const geometry = JSON.stringify(data.geometry);

  console.log(`🚀 Seeding Saribu Dolok: ${name} (${code})`);

  // Insert using raw SQL because Prisma doesn't support geometry type for insert natively
  await prisma.$executeRawUnsafe(`
    INSERT INTO regions (id, name, code, level, geometry, area_km2, updated_at)
    VALUES (
      gen_random_uuid(), 
      '${name}', 
      '${code}', 
      '${level}', 
      ST_GeomFromGeoJSON('${geometry}'),
      ST_Area(ST_GeomFromGeoJSON('${geometry}')::geography) / 1000000,
      NOW()
    )
    ON CONFLICT (code) DO NOTHING;
  `);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
