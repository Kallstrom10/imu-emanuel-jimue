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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BooksService } from './book.service';

// Configuração do Multer idêntica à dos membros
const multerOptions = {
  storage: diskStorage({
    destination: './uploads', // Garante que a pasta existe na raiz do backend
    filename: (req, file, cb) => {
      const ext = extname(file.originalname);

      // Acede ao título do livro e formata para URL amigável
      const tituloLivro = req.body.title
        ? req.body.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/\s+/g, '-')            // Substitui espaços por hífens
            .replace(/[^a-z0-9-]/g, '')      // Remove caracteres especiais
        : 'livro-sem-titulo';

      // Define o prefixo automaticamente: 'capa' para a imagem ou 'pdf' para o documento
      const prefixo = file.fieldname === 'pdf' ? 'pdf' : 'capa';

      const fileName = `${prefixo}-${tituloLivro}-${Date.now()}${ext}`;
      cb(null, fileName);
    },
  }),
};

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async getAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cover', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  async create(
    @Body() body: { title: string; },
    @UploadedFiles()
    files: { cover?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';

    const coverUrl = files?.cover?.[0] ? `${serverUrl}${files.cover[0].filename}` : '';
    const pdfUrl = files?.pdf?.[0] ? `${serverUrl}${files.pdf[0].filename}` : '';

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
      multerOptions,
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; },
    @UploadedFiles()
    files: { cover?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
    const updateData: any = {};

    if (body.title) updateData.title = body.title;
    
    if (files?.cover?.[0]) {
      updateData.coverUrl = `${serverUrl}/uploads/${files.cover[0].filename}`;
    }

    if (files?.pdf?.[0]) {
      updateData.pdfUrl = `${serverUrl}/uploads/${files.pdf[0].filename}`;
    }

    return this.booksService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.booksService.delete(id);
  }
}