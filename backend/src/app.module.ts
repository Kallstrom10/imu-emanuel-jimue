// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MembersModule } from './members/members.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BooksModule } from './books/book.module';
import { NewsModule } from './news/news.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1. Carrega as variáveis do ficheiro .env e torna-as globais na aplicação
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Conecta ao MongoDB lendo a variável MONGO_URI do .env (com fallback para local)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/emanuel',
      }),
    }),

    MembersModule,
    DashboardModule,
    BooksModule,
    NewsModule,
    AuthModule,
  ],
})
export class AppModule {}