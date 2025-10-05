import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // swagger
  const config = new DocumentBuilder()
    .setTitle("Anvy web app api")
    .setDescription("NestJs + Prisma + PostgresSQL API docs")
    .setVersion("1.0")
    .addTag("api")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document)

  // file upload multer
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  })

  // prefix & cors & validations
  app.setGlobalPrefix("api")
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
