import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from './schemas/book.schema';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  async findAll(): Promise<Book[]> {
    return this.bookModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) throw new NotFoundException('Livro não encontrado');
    return book;
  }

  async create(data: {
    title: string;
    coverUrl?: string;
    pdfUrl?: string;
  }): Promise<Book> {
    const newBook = new this.bookModel(data);
    return newBook.save();
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      coverUrl: string;
      pdfUrl: string;
    }>,
  ): Promise<Book> {
    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedBook) throw new NotFoundException('Livro não encontrado');
    return updatedBook;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Livro não encontrado');
    return { message: 'Livro eliminado com sucesso' };
  }
}