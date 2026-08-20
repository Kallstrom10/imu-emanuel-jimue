import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injetado pelo JwtAuthGuard

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException(
        'Acesso negado. Apenas administradores podem realizar esta ação.',
      );
    }

    return true;
  }
}