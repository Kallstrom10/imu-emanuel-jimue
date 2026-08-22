import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { MembersService } from '../members/members.service';

@Injectable()
export class TasksService {
  constructor(
    private notificationsService: NotificationsService,
    private membersService: MembersService
  ) {}

  // Corre todos os dias à meia-noite
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkBirthdays() {
    const aniversariantes = await this.membersService.findAniversariantesDoDia();
    
    for (const membro of aniversariantes) {
      await this.notificationsService.create({
        title: 'Feliz Aniversário! 🎉',
        message: `O membro ${membro.firstName} completa hoje mais um ano de vida!`,
        type: 'BIRTHDAY',
      });
    }
  }

  // Corre todas as segundas-feiras às 08:00
  @Cron('0 8 * * 1')
  async weeklySummary() {
    const count = await this.membersService.countMembrosRegistadosNaUltimaSemana();
    
    if (count > 0) {
      await this.notificationsService.create({
        title: 'Resumo Semanal 📊',
        message: `Na última semana, ${count} novos jovens juntaram-se à JIMUE.`,
        type: 'WEEKLY_SUMMARY',
      });
    }
  }
}