import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { CreateMemberDto } from './dto/create-member.dto';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async register(createMemberDto: CreateMemberDto): Promise<any> {
    const { firstName, lastName, phone, password, email } = createMemberDto;

    // 1. Verificar se já existe um membro com este telefone
    const existingMember = await this.memberModel.findOne({ phone });
    if (existingMember) {
      throw new ConflictException('Já existe um membro registado com este número de telefone.');
    }

    // 2. Encriptar a senha (saltRounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Criar o novo membro
    const newMember = new this.memberModel({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword, // Guardamos a senha encriptada
    });

    // 4. Salvar na base de dados
    const savedMember = await newMember.save();

    // Notificar criação de novo membro
    await this.notificationsService.create({
      title: 'Novo Membro Registado',
      message: `O jovem ${savedMember.firstName} ${savedMember.lastName} acabou de se registar no sistema.`,
      type: 'NEW_USER',
    });

    // 5. Retornar os dados (sem a senha por motivos de segurança)
    const result = savedMember.toObject();
    delete (result as any).password;
    return result;
  }

  // Busca todos os membros
  async findAll(): Promise<any[]> {
    const members = await this.memberModel.find().exec();
    
    // Convertemos para objeto e removemos a senha de todos para segurança
    return members.map(member => {
      const memberObj = member.toObject();
      delete (memberObj as any).password; 
      return memberObj;
    });
  }

  // Buscar apenas um membro pelo ID
  async findOne(id: string) {
    const membro = await this.memberModel.findById(id).exec();
    if (!membro) {
      throw new NotFoundException(`Membro com ID ${id} não encontrado`);
    }
    return membro;
  }

  async findByPhone(telefone: string): Promise<MemberDocument | null> {
    // Se no seu Schema o campo for 'phone' em vez de 'telefone', ajuste aqui:
    return this.memberModel.findOne({ phone: telefone }).exec();
  }

  // Editar um membro existente
  async update(id: string, dadosMembro: any) {
    const membroAtualizado = await this.memberModel
      .findByIdAndUpdate(id, dadosMembro, { new: true })
      .exec();
      
    if (!membroAtualizado) {
      throw new NotFoundException(`Membro com ID ${id} não encontrado para atualizar`);
    }
    return membroAtualizado;
  }

  // Eliminar um membro
  async remove(id: string) {
    const membroEliminado = await this.memberModel.findByIdAndDelete(id).exec();
    
    if (!membroEliminado) {
      throw new NotFoundException(`Membro com ID ${id} não encontrado para eliminar`);
    }
    return membroEliminado;
  }

  // =======================================================
  // NOVOS MÉTODOS PARA AS TAREFAS AUTOMÁTICAS (CRON)
  // =======================================================

  // Procura membros que fazem aniversário no dia de hoje
  async findAniversariantesDoDia(): Promise<MemberDocument[]> {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    return this.memberModel.find({
      $expr: {
        $and: [
          { $eq: [{ $dayOfMonth: '$birthDate' }, day] }, // Nota: altera 'birthDate' se no teu Schema for outro nome (ex: dataNascimento)
          { $eq: [{ $month: '$birthDate' }, month] },
        ],
      },
    }).exec();
  }

  // Conta os membros registados nos últimos 7 dias
  async countMembrosRegistadosNaUltimaSemana(): Promise<number> {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    return this.memberModel.countDocuments({
      createdAt: { $gte: seteDiasAtras },
    }).exec();
  }
}