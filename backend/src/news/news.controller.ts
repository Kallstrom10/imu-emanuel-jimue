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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { NewsService } from './news.service';

// Configuração do Multer com nomenclatura personalizada
const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const ext = extname(file.originalname);

      // Tratamento do título: remove acentos, caracteres especiais e substitui espaços por hífens
      const tituloNoticia = req.body.title
        ? req.body.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        : 'sem-titulo';

      const fileName = `noticia-${tituloNoticia}-${Date.now()}${ext}`;
      cb(null, fileName);
    },
  }),
};

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getAll() {
    return this.newsService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async create(
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('author') author: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
    const imageUrl = file ? `${serverUrl}/uploads/${file.filename}` : undefined;
    return this.newsService.create(title, content, author, imageUrl);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async update(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
    @Body('author') author?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
    const imageUrl = file ? `${serverUrl}/uploads/${file.filename}` : undefined;
    return this.newsService.update(id, title, content, author, imageUrl);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}