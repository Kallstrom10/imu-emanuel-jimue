import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NewsService } from './news.service';
import { uploadToCloudinary } from '../utils/upload.util';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getAll() {
    return this.newsService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('author') author: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined = undefined;

    if (file) {
      const tituloNoticia = title
        ? title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        : 'noticia';

      imageUrl = await uploadToCloudinary(
        'noticias',
        `noticia-${tituloNoticia}-${Date.now()}`,
        file.buffer,
      );
    }

    return this.newsService.create(title, content, author, imageUrl);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
    @Body('author') author?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined = undefined;

    if (file) {
      const tituloNoticia = title
        ? title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        : 'noticia';

      imageUrl = await uploadToCloudinary(
        'noticias',
        `noticia-${tituloNoticia}-${Date.now()}`,
        file.buffer,
      );
    }

    return this.newsService.update(id, title, content, author, imageUrl);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}



// jimue.74.emanuel@gmail.com - JIMUEemanuel74