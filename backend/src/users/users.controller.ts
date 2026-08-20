import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Protegido: Primeiro valida o Token JWT, depois verifica se é Admin
  @Patch('admin/reset-password')
  async adminResetPassword(@Body() dto: AdminResetPasswordDto) {
    return this.usersService.adminResetPassword(dto);
  }
}