import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateMemberDto } from './dto/create-member.dto';

// Importa aqui o teu Service (ajusta o caminho consoante o teu projeto)
import { MembersService } from './members.service'; 

// =================================================================
// 1. CONFIGURAÇÃO REUTILIZÁVEL DO MULTER
// =================================================================
const multerOptions = {
  storage: diskStorage({
    destination: './uploads', // Garante que esta pasta existe na raiz do backend
    filename: (req, file, cb) => {
      const ext = extname(file.originalname);

      // Acede ao nome do membro para personalizar o ficheiro
      const nomeUsuario = req.body.firstName
        ? req.body.firstName.toLowerCase().replace(/\s+/g, '-')
        : 'usuario-desconhecido';

      const fileName = `foto_perfil-${nomeUsuario}-${Date.now()}${ext}`;
      cb(null, fileName);
    },
  }),
};

// =================================================================
// 2. CONTROLLER
// =================================================================
@Controller('members')
export class MembersController {
  // Injeção de dependência do teu serviço
  constructor(private readonly membersService: MembersService) {}

  // --- GET: Buscar todos os membros ---
  @Get()
  async findAll() {
    return await this.membersService.findAll();
  }

  // --- GET: Buscar um membro específico (Opcional, mas recomendado) ---
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.membersService.findOne(id);
  }

  // --- POST: Criar novo membro ---
@Post('register')
  async register(@Body() body: any) { // Idealmente: body: CreateMemberDto
    return await this.membersService.register(body); 
  }

  // --- PUT: Editar membro existente ---
  @Put(':id')
  @UseInterceptors(FileInterceptor('photoFile', multerOptions))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any, // Substitui 'any' pelo teu UpdateMemberDto se tiveres
  ) {
    const dadosMembro = { ...body };

    // Se o utilizador enviou uma nova foto na edição, atualiza o URL
    if (file) {
      dadosMembro.photoUrl = `http://localhost:3001/uploads/${file.filename}`;
    }

    // Chama o teu service para atualizar na base de dados
    return await this.membersService.update(id, dadosMembro);
  }

  // --- DELETE: Eliminar membro ---
  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Chama o teu service para remover da base de dados
    return await this.membersService.remove(id);
  }
}