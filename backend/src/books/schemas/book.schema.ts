import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: false, default: '' })
  coverUrl!: string;

  @Prop({ required: false, default: '' })
  pdfUrl!: string;

  @Prop({ default: 0 })
  rating!: number; // Média geral (1 a 5)

  @Prop({ default: 0 })
  totalRatings!: number; // Total de avaliações recebidas

  @Prop({
    type: [{ userId: String, rating: Number }],
    default: [],
  })
  ratings!: { userId: string; rating: number }[];
}

export const BookSchema = SchemaFactory.createForClass(Book);