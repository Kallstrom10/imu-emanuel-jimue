import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3001;

  // Ativar a validação global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove campos não declarados no DTO
    forbidNonWhitelisted: true, // Rejeita se enviarem campos estranhos
    transform: true,
  }));

  //Configuração da pasta de imagens
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // O URL vai ficar /uploads/nome-da-imagem.jpg
  });

  //Permissão de requisições do Frontend Next.js
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Ativar CORS (Importante para o teu frontend se conectar sem erros)
  app.enableCors();

  await app.listen(port);
}
bootstrap();