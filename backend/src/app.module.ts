import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static'; // 1. Importar
import { join } from 'path';

import { MembersModule } from './members/members.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BooksModule } from './books/book.module';
import { NewsModule } from './news/news.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Tornar a pasta /uploads acessível publicamente na URL /uploads
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

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