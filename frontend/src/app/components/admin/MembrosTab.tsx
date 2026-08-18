"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Pencil,
  Trash2,
  X,
  User,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  Shield,
  Check,
  UserPlus,
  AlertCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";

// Tipo para o Membro
export interface Membro {
  id: string;
  firstName: string;
  lastName: string;
  dob?: string; // YYYY-MM-DD
  class?: string;
  education?: string;
  role?: string;
  memberLevel?: string;
  baptized?: string;
  address?: string;
  phone: string;
  email?: string;
  sex?: string;
  commission: string;
  photoFile?: File;
  photoUrl?: string;
  photoPreview?: string;
}

// Função utilitária para calcular idade
function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export default function MembrosTab() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState<Membro | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Membro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  // Estado para mensagens de sucesso/falha
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000); // Esconde a mensagem após 4 segundos
  };

  useEffect(() => {
    const fetchMembros = async () => {
      try {
        const response = await fetch(`${API_URL}/members`);
        if (!response.ok) {
          throw new Error('Erro ao buscar os membros');
        }
        const data = await response.json();

        // Mapear o _id do MongoDB para o id do teu frontend
        const membrosFormatados = data.map((item: any) => ({
          ...item,
          id: item._id, // Transforma o _id do Mongo no id da tua interface
        }));

        setMembros(membrosFormatados);
      } catch (error) {
        console.error("Erro ao carregar membros:", error);
        showNotification('error', 'Erro ao carregar a lista de membros.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembros();
  }, []);

  // Ordenar membros alfabeticamente pelo primeiro nome
  const sortedMembros = [...membros]
    .filter(
      (m) =>
        m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.commission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.class || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  //Foto de perfil - Edição
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingMember) {
      const imageUrl = URL.createObjectURL(file);
      
      setEditingMember({ 
        ...editingMember, 
        photoPreview: imageUrl, 
        photoFile: file
      });
    }
  };

// Guardar edições (Requisição PUT para o backend)
const handleSaveEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingMember) return;

  try {
    // 1. Criar o FormData em vez de JSON
    const formData = new FormData();

    // 2. Anexar todos os campos de texto do membro
    Object.keys(editingMember).forEach((key) => {
      // Ignora o ficheiro e o preview para não enviar dados duplicados ou nulos
      if (
        key !== 'photoFile' && 
        key !== 'photoPreview' && 
        editingMember[key as keyof typeof editingMember] !== null &&
        editingMember[key as keyof typeof editingMember] !== undefined
      ) {
        formData.append(key, editingMember[key as keyof typeof editingMember] as string);
      }
    });

    // 3. Anexar o ficheiro da imagem de perfil (se selecionado)
    if (editingMember.photoFile) {
      formData.append('photoFile', editingMember.photoFile);
    }

    const response = await fetch(`${API_URL}/members/${editingMember.id}`, {
      method: 'PUT',
      // Sem o 'Content-Type': 'application/json' para o browser definir multipart/form-data
      body: formData,
    });

    if (!response.ok) throw new Error('Erro ao atualizar membro');

    // 4. Obtém o membro atualizado retornado pelo backend (que já contém a nova photoUrl)
    const updatedMember = await response.json();

    // Garante que o objeto tem tanto o 'id' como o '_id'
    const formattedMember = {
    ...updatedMember,
    id: updatedMember.id || updatedMember._id,
  };
    // Atualiza o estado local recarregando os dados novos na tabela
    setMembros(membros.map((m) => (m.id === editingMember.id ? formattedMember : m)));
    setEditingMember(null);
    showNotification('success', 'Dados do membro atualizados com sucesso!');
  } catch (error) {
    console.error(error);
    showNotification('error', 'Falha ao atualizar os dados do membro.');
  }
};

  // Confirmar eliminação do membro (Requisição DELETE para o backend)
  const confirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(`${API_URL}/members/${memberToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao eliminar membro');

      // Atualiza o estado local removendo o membro apagado
      setMembros(membros.filter((m) => m.id !== memberToDelete.id));
      showNotification('success', 'Membro eliminado com sucesso!');
    } catch (error) {
      console.error(error);
      showNotification('error', 'Falha ao eliminar o membro.');
    } finally {
      setMemberToDelete(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* NOTIFICAÇÃO DE SUCESSO OU ERRO */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-6 py-4 rounded-xl shadow-lg shadow-black/10 text-sm font-bold text-white transition-all animate-in slide-in-from-top-5 duration-300 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {notification.text}
        </div>
      )}

      {/* topo: Título e Barra de Pesquisa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Lista de Membros da Juventude
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestão completa e atualização de dados dos jovens
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <Link
            href="/cadastro"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-2xl transition-all shadow-sm shrink-0 whitespace-nowrap"
          >
            <UserPlus size={16} />
            <span>Adicionar Membro</span>
          </Link>
        </div>
      </div>

      {/* TABELA DE MEMBROS */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Foto</th>
                <th className="py-4 px-6">Nome</th>
                <th className="py-4 px-6">Idade</th>
                <th className="py-4 px-6">Classe</th>
                <th className="py-4 px-6">Morada</th>
                <th className="py-4 px-6">Telefone</th>
                <th className="py-4 px-6">Batizado</th>
                <th className="py-4 px-6">Nível</th>
                <th className="py-4 px-6">Escolaridade</th>
                <th className="py-4 px-6">Comissão</th>
                <th className="py-4 px-6">Cargo</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-12 text-center text-slate-500 font-medium animate-pulse"
                  >
                    A carregar membros...
                  </td>
                </tr>
              ) : sortedMembros.length > 0 ? (
                sortedMembros.map((membro) => {
                  const idade = membro.dob ? calculateAge(membro.dob) : 'N/A';
                  return (
                    <tr
                      key={membro.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* 1. Foto / Avatar */}
                      <td className="py-5 px-6">
                        {membro.photoUrl ? (
                          <img
                            src={membro.photoUrl}
                            alt={`${membro.firstName} ${membro.lastName}`}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 cursor-pointer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 cursor-pointer font-extrabold flex items-center justify-center text-lg border border-red-100 shadow-sm">
                            {membro.firstName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>

                      {/* 2. Nome */}
                      <td className="py-5 px-6 font-bold text-slate-800 text-sm">
                        {membro.firstName} {membro.lastName}
                        {membro.email && (
                          <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                            {membro.email}
                          </span>
                        )}
                      </td>

                      {/* 3. Idade */}
                      <td className="py-5 px-6 text-slate-600 font-medium whitespace-nowrap">
                        <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap">
                          {idade} anos
                        </span>
                      </td>

                      {/* 4. Classe */}
                      <td className="py-5 px-6 font-semibold text-slate-700">
                        {membro.class || "Betânia"}
                      </td>

                      {/* 5. Morada */}
                      <td className="py-5 px-6 text-slate-600 text-xs max-w-[180px]">
                        {membro.address ? (
                          <span className="block whitespace-normal break-words leading-relaxed" title={membro.address}>
                            {membro.address}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Não informada</span>
                        )}
                      </td>

                      {/* 6. Telefone */}
                      <td className="py-5 px-6 text-slate-700 font-medium text-xs whitespace-nowrap">
                        {membro.phone}
                      </td>

                      {/* 7. Batizado */}
                      <td className="py-5 px-6">
                        <span className={`inline-block px-3 py-1 rounded-xl text-[11px] font-medium border ${
                          membro.baptized === "Sim" 
                            ? "bg-cyan-50 text-cyan-700 border-cyan-100" 
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {membro.baptized === "Sim" ? "Sim" : "Não"}
                        </span>
                      </td>

                      {/* 8. Nível do Membro */}
                      <td className="py-5 px-6">
                        <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
                          {membro.memberLevel || "Catecúmeno"}
                        </span>
                      </td>

                      {/* 9. Escolaridade */}
                      <td className="py-5 px-6">
                        <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                          {membro.education || "Ensino Primário"}
                        </span>
                      </td>

                      {/* 10. Comissão */}
                      <td className="py-5 px-6 max-w-[180px]">
                        {membro.commission ? (
                          <span className="inline-block px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 whitespace-normal break-words text-center leading-tight">
                            {membro.commission}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Nenhuma</span>
                        )}
                      </td>

                      {/* 11. Cargo na Juventude */}
                      <td className="py-5 px-6 max-w-[150px]">
                        <span className="inline-block px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-normal break-words text-center leading-tight">
                          {membro.role}
                        </span>
                      </td>

                      {/* 12. Ações */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingMember(membro)}
                            className="p-2.5 rounded-xl cursor-pointer bg-slate-100 text-slate-600 hover:bg-green-600 hover:text-white transition-all border border-slate-200/60"
                            title="Editar Membro"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(membro)}
                            className="p-2.5 rounded-xl bg-slate-100 cursor-pointer text-slate-600 hover:bg-red-600 hover:text-white transition-all border border-slate-200/60"
                            title="Eliminar Membro"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL DE ELIMINAÇÃO PERSONALIZADO ================= */}
      {memberToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>

          <h3 className="text-base font-bold text-slate-800 mb-2">
            Eliminar Membro
          </h3>

          <p className="text-xs text-slate-500 mb-6">
            Tens a certeza que desejas eliminar{" "}
            <span className="font-bold text-slate-700">
              "{memberToDelete.firstName} {memberToDelete.lastName}"
            </span>
            ? Esta ação não pode ser desfeita.
          </p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setMemberToDelete(null)}
              className="w-full py-3 rounded-xl cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isDeleting} // Remova se não tiver estado de carregamento
              onClick={confirmDelete}
              className="w-full py-3 rounded-xl cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
            >
              {isDeleting && <Loader2 className="animate-spin" size={14} />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
      )}

{/* ================= MODAL DE EDIÇÃO CENTRALIZADO ================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Topo do Modal */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Editar Dados do Membro</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Atualiza as informações de {editingMember.firstName}{" "}
                  {editingMember.lastName}
                </p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-2 rounded-xl bg-slate-800 cursor-pointer text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário de Edição */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              
              {/* Foto de Perfil (Esquerda) e Sexo (Direita) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Foto de Perfil
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {editingMember.photoPreview || editingMember.photoUrl ? (
                        <img
                          src={editingMember.photoPreview || editingMember.photoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="foto-upload-edit"
                        className="inline-block px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all border border-slate-200"
                      >
                        Escolher do Computador
                      </label>
                      <input
                        id="foto-upload-edit"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Campo Sexo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sexo *
                  </label>
                  <select
                    required
                    value={editingMember.sex || "Masculino"}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        sex: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>

              {/* Nome e Sobrenome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Primeiro Nome *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={editingMember.firstName}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.lastName}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Data de Nascimento e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Data de Nascimento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={editingMember.dob || ""}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          dob: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Telefone *
                  </label>
                  <div className="relative flex">
                    <span className="flex items-center px-3 py-3 bg-slate-200/80 border border-slate-200 border-r-0 rounded-l-xl text-xs font-bold text-slate-600">
                      +244
                    </span>
                    <input
                      type="tel"
                      required
                      value={editingMember.phone}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Morada e Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Morada *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maianga, Rua da Paz, Nº 12"
                    value={editingMember.address || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="exemplo@gmail.com"
                      value={editingMember.email || ""}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Nível do Membro e Batizado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nível do Membro *
                  </label>
                  <select
                    required
                    value={editingMember.memberLevel || "Catecúmeno"}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        memberLevel: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="Catecúmeno">Catecúmeno</option>
                    <option value="A Prova">A Prova</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Batizado? *
                  </label>
                  <select
                    required
                    value={editingMember.baptized || "Não"}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        baptized: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
              </div>

              {/* Classe e Escolaridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Classe */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Classe *
                  </label>
                  <select
                    value={editingMember.class || "Betânia"}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        class: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="Betânia">Betânia</option>
                    <option value="São Paulo">São Paulo</option>
                    <option value="Damasco">Damasco</option>
                    <option value="Belém">Belém</option>
                    <option value="Canaã">Canaã</option>
                    <option value="Isaías">Isaías</option>
                    <option value="Luz">Luz</option>
                    <option value="Zacarias">Zacarias</option>
                    <option value="Dona Antónia Melão">Dona Antónia Melão</option>
                    <option value="Ester">Ester</option>
                    <option value="Matoso">Matoso</option>
                  </select>
                </div>

                {/* Escolaridade */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Escolaridade *
                  </label>
                  <select
                    value={editingMember.education}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        education: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="Ensino Primário">Ensino Primário</option>
                    <option value="Iº Ciclo">Iº Ciclo</option>
                    <option value="Ensino Médio">Ensino Médio</option>
                    <option value="Ensino Superior">Ensino Superior</option>
                    <option value="Lincenciado">Licenciado(a)</option>
                    <option value="Bacharelato">Bacharelato</option>
                  </select>
                </div>
              </div>

              {/* Comissão e Cargo na Juventude Alinhados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Comissão */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Comissão
                  </label>
                  <select
                    value={editingMember.commission || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        commission: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="">Sem Comissão / Nenhuma</option>
                    <option value="Comissão de Informação e Comunicação">Comissão de Informação e Comunicação</option>
                    <option value="Comissão de Evangelismo">Comissão de Evangelismo</option>
                    <option value="Comissão de Cultura">Comissão de Cultura</option>
                    <option value="Comissão de Fraternidade e Ecumenismo">Comissão de Fraternidade e Ecumenismo</option>
                    <option value="Comissão de Assuntos Sociais e Comunitários">Comissão de Assuntos Sociais e Comunitários</option>
                    <option value="Comissão de Recreação e Desporto">Comissão de Recreação e Desporto</option>
                    {/* <option value="Comissão de Recreação e Desporto">Comissão de Recreação e Desporto</option>
                    <option value="Comissão de Finanças">Comissão de Finanças</option>
                    <option value="Comissão de Intercessão">Comissão de Intercessão</option>
                    <option value="Comissão de Património">Comissão de Património</option>
                    <option value="Comissão de Cultura e Artes">Comissão de Cultura e Artes</option>
                    <option value="Comissão de Apoio Técnico">Comissão de Apoio Técnico</option>
                    <option value="Comissão de Integração de Jovens">Comissão de Integração de Jovens</option>
                    <option value="Comissão de Relações Públicas">Comissão de Relações Públicas</option>
                    <option value="Comissão de Formação de Liderança">Comissão de Formação de Liderança</option> */}
                  </select>
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cargo na Juventude *
                  </label>
                  <select
                    required
                    value={editingMember.role || "Membro"}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 font-medium cursor-pointer"
                  >
                    <optgroup label="Geral" className='bg-red-200'>
                      <option value="Membro" className='bg-white'>Membro de Base</option>
                    </optgroup>
                    <optgroup label="Corpo Executivo" className='bg-red-200'>
                      <option value="Diretor" className='bg-white'>Diretor</option>
                      <option value="Diretora" className='bg-white'>Diretora</option>
                      <option value="Vice-Diretor" className='bg-white'>Vice-Diretor</option>
                      <option value="Vice-Diretora" className='bg-white'>Vice-Diretora</option>
                      <option value="Secretário Executivo" className='bg-white'>Secretário</option>
                      <option value="Secretária Executiva"className='bg-white'>Secretária</option>
                      <option value="Tesoureiro" className='bg-white'>Tesoureiro</option>
                      <option value="Tesoureira" className='bg-white'>Tesoureira</option>
                    </optgroup>
                    <optgroup label="Corpo Diretivo" className='bg-red-200'>
                      <option value="Secretário" className='bg-white'>Secretário</option>
                      <option value="Secretária" className='bg-white'>Secretária</option>
                      <option value="Vice-Secretário" className='bg-white'>Vice-Secretário</option>
                      <option value="Vice-Secretária" className='bg-white'>Vice-Secretária</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-5 cursor-pointer py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 cursor-pointer rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20 flex items-center gap-2"
                >
                  <Check size={16} /> Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}