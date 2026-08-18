import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MemberDocument = Member & Document;

@Schema({ timestamps: true }) // Guarda automaticamente a data de criação e atualização (createdAt, updatedAt)
export class Member {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  password!: string; // Será guardada encriptada

  @Prop({ required: false })
  email?: string;

  // Campos que serão preenchidos depois pelo admin (todos opcionais)
  @Prop({ required: false })
  dob?: string; // Data de nascimento

  @Prop({ required: false, default: 'IMU Emanuel' })
  address?: string;

  @Prop({ required: false, default: 'Catecúmeno' })
  memberLevel?: string;

  @Prop({ required: false, default: 'Não' })
  baptized?: string;

  @Prop({ required: false, default: 'Betânia' })
  class?: string; // Classe

  @Prop({ required: false, default: 'Masculino' })
  sex?: string; // sexo

  @Prop({ required: false, default: 'Sem Comissão / Nenhuma' })
  commission?: string; // comissão

  @Prop({ required: false, default: 'Ensino Primário' })
  education?: string; // Escolaridade

  @Prop({ required: false })
  photoUrl?: string; // Foto de perfil

  @Prop({ required: false, default: 'Membro de Base' })
  role?: string; // Cargo na Juventude
}

export const MemberSchema = SchemaFactory.createForClass(Member);