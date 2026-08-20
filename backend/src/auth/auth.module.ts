import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MembersModule } from '../members/members.module';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    MembersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_jimue_2026',
      signOptions: { expiresIn: '7d' }, // Token válido por 7 dias
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AdminGuard, JwtAuthGuard],
  exports: [AuthService, AdminGuard, JwtAuthGuard],
})
export class AuthModule {}