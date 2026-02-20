import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const geojsonPath = path.resolve(__dirname, '../../../geosjon/saribu_dolok_12.08.25.1012.geojson');
  const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

  const { name, code, level } = data.properties;
  const geometry = JSON.stringify(data.geometry);

  console.log(`🚀 Seeding Saribu Dolok: ${name} (${code})`);

  // Insert using raw SQL because Prisma doesn't support geometry type for insert natively
  await prisma.$executeRawUnsafe(`
    INSERT INTO regions (id, name, code, level, geometry, updated_at)
    VALUES (
      gen_random_uuid(), 
      '${name}', 
      '${code}', 
      '${level}', 
      ST_GeomFromGeoJSON('${geometry}'),
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
