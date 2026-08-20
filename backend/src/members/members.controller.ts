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
import { memoryStorage } from 'multer';
import { MembersService } from './members.service';
import { uploadToCloudinary } from '../utils/upload.util';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll() {
    return await this.membersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.membersService.findOne(id);
  }

  @Post('register')
  async register(@Body() body: any) {
    return await this.membersService.register(body);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photoFile', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const dadosMembro = { ...body };

    if (file) {
      const nomeUsuario = body.firstName
        ? body.firstName.toLowerCase().replace(/\s+/g, '-')
        : 'membro';
      const publicId = `perfil-${nomeUsuario}-${Date.now()}`;

      // Upload da foto de perfil para o Cloudinary (pasta: jimue/membros)
      dadosMembro.photoUrl = await uploadToCloudinary(
        'membros',
        publicId,
        file.buffer,
      );
    }

    return await this.membersService.update(id, dadosMembro);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.membersService.remove(id);
  }
}