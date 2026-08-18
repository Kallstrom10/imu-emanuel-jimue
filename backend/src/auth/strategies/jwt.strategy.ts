import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_jimue_2026',
    });
  }

  async validate(payload: any) {
    // O retorno deste método fica disponível no objeto `req.user`
    return {
      id: payload.sub,
      nome: payload.nome,
      telefone: payload.telefone,
      cargo: payload.cargo,
    };
  }
}