import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member, MemberDocument } from '../members/schemas/member.schema'; 

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async getDashboardStats() {
    // 1. Procurar todos os membros na coleção 'members' do MongoDB
    const members = await this.memberModel.find().lean();

    // Funções auxiliares para ignorar maiúsculas/minúsculas
    const isMale = (m: Member) => {
      const s = m.sex?.toLowerCase() || '';
      return s === 'masculino' || s === 'm' || s === 'homem';
    };

    const isFemale = (m: Member) => {
      const s = m.sex?.toLowerCase() || '';
      return s === 'feminino' || s === 'f' || s === 'mulher';
    };

    const totalJovens = members.length;
    const totalHomens = members.filter(isMale).length;
    const totalMulheres = members.filter(isFemale).length;

    // Helper para contagem de M / F por lista
    const calcularGenero = (lista: Member[]) => ({
      total: lista.length,
      m: lista.filter(isMale).length,
      f: lista.filter(isFemale).length,
    });

    // 2. Filtros por Categoria (memberLevel: 'Efectivo', 'Em Prova', 'Catecúmeno')
    const efectivosList = members.filter((m) =>
      m.memberLevel?.toLowerCase().includes('efectivo') || 
      m.memberLevel?.toLowerCase().includes('efetivo')
    );
    const emProvaList = members.filter((m) =>
      m.memberLevel?.toLowerCase().includes('prova')
    );
    const catecumenosList = members.filter((m) =>
      m.memberLevel?.toLowerCase().includes('catecúmeno') || 
      m.memberLevel?.toLowerCase().includes('catecumeno')
    );

    const efectivos = calcularGenero(efectivosList);
    const emProva = calcularGenero(emProvaList);
    const catecumenos = calcularGenero(catecumenosList);

    // 3. Filtros por Batismo (baptized: 'Sim' / 'Não')
    const batizadosList = members.filter((m) => {
      const b = m.baptized?.toLowerCase() || '';
      return b === 'sim' || b === 'true';
    });
    
    const naoBatizadosList = members.filter((m) => {
      const b = m.baptized?.toLowerCase() || '';
      return b !== 'sim' && b !== 'true';
    });

    const batizados = calcularGenero(batizadosList);
    const naoBatizados = calcularGenero(naoBatizadosList);

    // 4. Mapeamento por Classe (class)
    const listaClassesPadrao = [
      'Betânia',
      'São Paulo',
      'Damasco',
      'Belém',
      'Canaã',
      'Isaías',
      'Luz',
      'Zacarias',
      'Dona Antónia Melão',
      'Ester',
      'Matoso',
    ];

    const classesMap = new Map<string, { total: number; m: number; f: number }>();

    // Inicializa o mapa para todas as classes existentes aparecerem
    listaClassesPadrao.forEach((nome) => {
      classesMap.set(nome, { total: 0, m: 0, f: 0 });
    });

    members.forEach((m) => {
      const nomeClasse = m.class;
      if (nomeClasse) {
        // Encontra a chave ignorando maiúsculas/minúsculas
        const chaveExistente = Array.from(classesMap.keys()).find(
          (k) => k.toLowerCase() === nomeClasse.toLowerCase()
        ) || nomeClasse;

        const atual = classesMap.get(chaveExistente) || { total: 0, m: 0, f: 0 };
        atual.total += 1;
        if (isMale(m)) atual.m += 1;
        if (isFemale(m)) atual.f += 1;
        classesMap.set(chaveExistente, atual);
      }
    });

    const classes = Array.from(classesMap.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));

    return {
      totalJovens,
      totalHomens,
      totalMulheres,
      categorias: {
        efectivos,
        emProva,
        catecumenos,
      },
      batismo: {
        batizados,
        naoBatizados,
      },
      classes,
    };
  }
}