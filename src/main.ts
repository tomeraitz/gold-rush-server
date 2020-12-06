import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // for testing

  if (process.env.DEBUG_MODE) {
    app.useStaticAssets(join(__dirname, '..', 'static'));
  }
  app.enableCors();
  const port = process.env.PORT || 8000;
  await app.listen(port);
}
bootstrap();
