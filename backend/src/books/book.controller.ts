import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BooksService } from './book.service';
import { uploadToCloudinary, uploadPdfToCloudinary } from '../utils/upload.util';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async getAll() {
    return this.booksService.findAll();
  }

  // Novo Rota: Procurar o histórico de avaliações do utilizador logado
  @Get('user-ratings/:userId')
  async getUserRatings(@Param('userId') userId: string) {
    return this.booksService.getUserRatings(userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  // Nova Rota: Submeter avaliação de um livro
  @Post(':id/rate')
  async rateBook(
    @Param('id') id: string,
    @Body() body: { userId: string; rating: number },
  ) {
    if (!body.userId || !body.rating) {
      throw new BadRequestException('userId e rating são obrigatórios');
    }
    return this.booksService.rateBook(id, body.userId, Number(body.rating));
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cover', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() body: { title: string },
    @UploadedFiles()
    files: { cover?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    let coverUrl = '';
    let pdfUrl = '';

    const tituloSanitizado = body.title
      ? body.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      : 'livro';

    if (files?.cover?.[0]) {
      coverUrl = await uploadToCloudinary(
        'livros',
        `capa-${tituloSanitizado}-${Date.now()}`,
        files.cover[0].buffer,
      );
    }

    if (files?.pdf?.[0]) {
      pdfUrl = await uploadPdfToCloudinary(
        'livros/pdfs',
        `livro-${tituloSanitizado}-${Date.now()}`,
        files.pdf[0].buffer,
      );
    }

    return this.booksService.create({
      title: body.title,
      coverUrl,
      pdfUrl,
    });
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cover', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string },
    @UploadedFiles()
    files: { cover?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const updateData: any = {};
    if (body.title) updateData.title = body.title;

    const tituloSanitizado = body.title
      ? body.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      : 'livro';

    if (files?.cover?.[0]) {
      updateData.coverUrl = await uploadToCloudinary(
        'livros',
        `capa-${tituloSanitizado}-${Date.now()}`,
        files.cover[0].buffer,
      );
    }

    if (files?.pdf?.[0]) {
      updateData.pdfUrl = await uploadPdfToCloudinary(
        'livros/pdfs',
        `livro-${tituloSanitizado}-${Date.now()}`,
        files.pdf[0].buffer,
      );
    }

    return this.booksService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.booksService.delete(id);
  }
}