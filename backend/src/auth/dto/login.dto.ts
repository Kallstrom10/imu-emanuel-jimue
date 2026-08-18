import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'O número de telefone é obrigatório.' })
  @IsString()
  phone!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password!: string;
}