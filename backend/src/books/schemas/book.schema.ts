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
}

export const BookSchema = SchemaFactory.createForClass(Book);