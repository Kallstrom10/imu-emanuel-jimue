import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const newNotification = new this.notificationModel(createNotificationDto);
    return newNotification.save();
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }
    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .exec();

    if (!updatedNotification) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }
    return updatedNotification;
  }

  async remove(id: string): Promise<Notification> {
    const deletedNotification = await this.notificationModel.findByIdAndDelete(id).exec();
    if (!deletedNotification) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }
    return deletedNotification;
  }

  async markAllAsRead() {
    return this.notificationModel
      .updateMany({ isRead: false }, { $set: { isRead: true } })
      .exec();
  }
}