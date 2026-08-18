// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembersModule } from './members/members.module'; // Vamos criar este módulo já a seguir
import { DashboardModule } from './dashboard/dashboard.module';
import { BooksModule } from './books/book.module';
import { NewsModule } from './news/news.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Ligação ao MongoDB local na base de dados "emanuel"
    MongooseModule.forRoot('mongodb://localhost:27017/emanuel'),
    MembersModule,
    DashboardModule,
    BooksModule,
    NewsModule,
    AuthModule,
  ],
})
export class AppModule {}