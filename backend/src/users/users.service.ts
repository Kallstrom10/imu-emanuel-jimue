import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Member, MemberDocument } from '../members/schemas/member.schema';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async adminResetPassword(dto: AdminResetPasswordDto): Promise<{ message: string }> {
    const { phone, newPassword } = dto;

    // 1. Procurar o membro pelo número de telefone
    const member = await this.memberModel.findOne({ phone });
    if (!member) {
      throw new NotFoundException('Nenhum utilizador encontrado com este número de telefone.');
    }

    // 2. Encriptar a nova palavra-passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Atualizar a palavra-passe e guardar
    member.password = hashedPassword;
    await member.save();

    return { message: `Palavra-passe do número ${phone} atualizada com sucesso!` };
  }
}