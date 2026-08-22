import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member, MemberSchema } from './schemas/member.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    // Registar o Schema neste módulo
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
    NotificationsModule,
  ],  
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}