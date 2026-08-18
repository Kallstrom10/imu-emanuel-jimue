import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from './schemas/news.schema';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
  ) {}

  async findAll(): Promise<News[]> {
    return this.newsModel.find().sort({ createdAt: -1 }).exec();
  }

  async create(title: string, content: string, author: string, imageUrl?: string): Promise<News> {
    const newNews = new this.newsModel({ title, content, author, imageUrl });
    return newNews.save();
  }

  async update(id: string, title?: string, content?: string, author?: string, imageUrl?: string): Promise<News> {
    const updateData: Partial<News> = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (author) updateData.author = author;
    if (imageUrl) updateData.imageUrl = imageUrl;

    const updatedNews = await this.newsModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedNews) {
      throw new NotFoundException('Notícia não encontrada');
    }
    return updatedNews;
  }

  async delete(id: string): Promise<News> {
    const deletedNews = await this.newsModel.findByIdAndDelete(id).exec();
    if (!deletedNews) {
      throw new NotFoundException('Notícia não encontrada');
    }
    return deletedNews;
  }
}