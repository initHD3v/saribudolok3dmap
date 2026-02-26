import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Penting agar Frontend bisa akses API
  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Backend is running on: http://localhost:3001`);
}
bootstrap();
