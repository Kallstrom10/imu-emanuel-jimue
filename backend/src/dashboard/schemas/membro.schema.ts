import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MembroDocument = Membro & Document;

@Schema({ timestamps: true, collection: 'membros' })
export class Membro {
  @Prop({ required: true })
  nome!: string;

  // Aceita 'M' para Masculino e 'F' para Feminino
  @Prop({ required: true, enum: ['M', 'F'] })
  genero!: string;

  // Categorias válidas
  @Prop({ required: true, enum: ['EFECTIVO', 'EM_PROVA', 'CATECUMENO'] })
  categoria!: string;

  // Estado de batismo
  @Prop({ required: true, default: false })
  batizado!: boolean;

  // Nome da classe (ex: Betânia, São Paulo, Belém, etc.)
  @Prop({ required: true })
  classe!: string;
}

export const MembroSchema = SchemaFactory.createForClass(Membro);