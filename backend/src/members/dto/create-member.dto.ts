import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório' })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'O último nome é obrigatório' })
  lastName!: string;

  @IsString()
  @IsNotEmpty({ message: 'O número de telefone é obrigatório' })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password!: string;

  @IsString()
  @IsOptional()
  photoUrl!: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional() // O email é opcional no cadastro
  email?: string;
}