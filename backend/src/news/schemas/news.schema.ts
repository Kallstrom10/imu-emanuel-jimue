import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

@Schema({ timestamps: true })
export class News {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  author!: string;

  @Prop()
  imageUrl!: string;
}

export const NewsSchema = SchemaFactory.createForClass(News);