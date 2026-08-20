import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @IsNotEmpty({ message: 'O número de telefone é obrigatório.' })
  @IsString()
  phone!: string;

  @IsNotEmpty({ message: 'A nova palavra-passe é obrigatória.' })
  @IsString()
  @MinLength(6, { message: 'A palavra-passe deve ter pelo menos 6 caracteres.' })
  newPassword!: string;
}