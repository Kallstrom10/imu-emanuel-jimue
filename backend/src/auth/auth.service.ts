import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { MembersService } from '../members/members.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: MembersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    // 1. Buscar usuário pelo telefone no banco de dados
    const user = await this.usersService.findByPhone(phone);

    if (!user) {
      throw new UnauthorizedException('Telefone ou senha incorretos.');
    }

    // 2. Validar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Telefone ou senha incorretos.');
    }

    // 3. Montar Payload do Token
    const payload = {
      sub: user._id,
      primeiro: user.firstName,
      ultimo: user.lastName,
      telefone: user.phone,
      cargo: user.role || 'membro',
    };

    // 4. Retornar dados formatados e Token JWT
    return {
      user: {
        id: user._id,
        primeiro: user.firstName,
        ultimo: user.lastName,
        telefone: user.phone,
        cargo: user.role || 'membroaa',
        avatarUrl: user.photoUrl || null,
      },
      token: this.jwtService.sign(payload),
    };
  }
}