import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  // Novo método: Registar / Atualizar Avaliação do Livro
  async rateBook(bookId: string, userId: string, rating: number): Promise<Book> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('A nota deve ser entre 1 e 5.');
    }

    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Livro não encontrado');

    // Procura se o utilizador já avaliou este livro
    const existingIndex = book.ratings.findIndex((r) => r.userId === userId);

    if (existingIndex > -1) {
      book.ratings[existingIndex].rating = rating;
    } else {
      book.ratings.push({ userId, rating });
    }

    // Recalcula média e contagem
    const total = book.ratings.length;
    const sum = book.ratings.reduce((acc, curr) => acc + curr.rating, 0);

    book.rating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
    book.totalRatings = total;

    return book.save();
  }

  // Novo método: Procurar todas as avaliações feitas por um determinado utilizador
  async getUserRatings(userId: string): Promise<{ [key: string]: number }> {
    const books = await this.bookModel.find({ 'ratings.userId': userId }).exec();
    const ratingsMap: { [key: string]: number } = {};

    books.forEach((book) => {
      const userRating = book.ratings.find((r) => r.userId === userId);
      if (userRating) {
        ratingsMap[book._id.toString()] = userRating.rating;
      }
    });

    return ratingsMap;
  }
}