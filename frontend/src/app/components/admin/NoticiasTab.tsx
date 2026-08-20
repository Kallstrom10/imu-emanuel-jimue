"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Newspaper,
  Calendar,
  Clock,
} from "lucide-react";

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Notification {
  type: "success" | "error";
  message: string;
}

export default function NoticiasTab() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notificações Flutuantes (Toast)
  const [notification, setNotification] = useState<Notification | null>(null);

  // Estados dos Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [viewingNews, setViewingNews] = useState<NewsItem | null>(null);
  const [deletingNews, setDeletingNews] = useState<NewsItem | null>(null);

  // Estados do Formulário
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Função para garantir que a imagem do Cloudinary ou servidor carrega corretamente
  const getImageUrl = (url?: string) => {
    if (!url || typeof url !== "string" || url.trim() === "") {
      return "/placeholder.png"; // Imagem padrão se não houver foto
    }

    const cleanUrl = url.trim();

    // Se a URL for do Cloudinary ou um link externo completo (http, https, //)
    if (
      cleanUrl.startsWith("http://") ||
      cleanUrl.startsWith("https://") ||
      cleanUrl.startsWith("//") ||
      cleanUrl.includes("cloudinary.com") ||
      cleanUrl.includes("res.cloudinary")
    ) {
      // Força HTTPS para evitar erro de Mixed Content em produção
      if (cleanUrl.startsWith("http://")) {
        return cleanUrl.replace("http://", "https://");
      }
      if (cleanUrl.startsWith("//")) {
        return `https:${cleanUrl}`;
      }
      if (!cleanUrl.startsWith("http")) {
        return `https://${cleanUrl}`;
      }
      return cleanUrl;
    }

    // Caso contrário, junta com a URL da API (para ficheiros locais/antigos)
    const formattedBaseUrl = API_URL.endsWith("/")
      ? API_URL.slice(0, -1)
      : API_URL;
    const formattedUrl = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;

    return `${formattedBaseUrl}${formattedUrl}`;
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Buscar notícias do Backend
  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/news`);
      if (res.ok) {
        const data = await res.json();
        setNewsList(data);
      } else {
        console.error("Erro ao carregar notícias");
      }
    } catch (error) {
      console.error("Erro de conexão ao carregar notícias:", error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Controlo dos Modais de Formulário
  const openAddModal = () => {
    setEditingNews(null);
    setTitleInput("");
    setContentInput("");
    setAuthorInput("");
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (news: NewsItem) => {
    setEditingNews(news);
    setTitleInput(news.title);
    setContentInput(news.content);
    setAuthorInput(news.author || "");
    setImageFile(null);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingNews(null);
    setTitleInput("");
    setContentInput("");
    setAuthorInput("");
    setImageFile(null);
  };

  // Guardar (Criar / Editar)
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !contentInput.trim() || !authorInput.trim()) {
      showNotification("error", "Título, conteúdo e autor são obrigatórios!");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", titleInput);
      formData.append("content", contentInput);
      formData.append("author", authorInput);

      if (imageFile) formData.append("image", imageFile);

      let res: Response;

      if (editingNews) {
        res = await fetch(`${API_URL}/news/${editingNews._id}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        res = await fetch(`${API_URL}/news`, {
          method: "POST",
          body: formData,
        });
      }

      if (res.ok) {
        closeModal();
        fetchNews();
        showNotification(
          "success",
          editingNews
            ? "Notícia atualizada com sucesso!"
            : "Notícia publicada com sucesso!"
        );
      } else {
        const errData = await res.json();
        showNotification(
          "error",
          errData.message || "Erro ao guardar a notícia."
        );
      }
    } catch (error) {
      console.error("Erro ao guardar notícia:", error);
      showNotification("error", "Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar
  const confirmDeleteNews = async () => {
    if (!deletingNews) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${API_URL}/news/${deletingNews._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNewsList((prev) => prev.filter((n) => n._id !== deletingNews._id));
        showNotification("success", "Notícia eliminada com sucesso!");
      } else {
        showNotification("error", "Erro ao eliminar a notícia.");
      }
    } catch (error) {
      console.error("Erro ao eliminar notícia:", error);
      showNotification("error", "Erro ao conectar com o servidor.");
    } finally {
      setIsDeleting(false);
      setDeletingNews(null);
    }
  };

  // Formatar Data e Hora
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data desconhecida";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  const filteredNews = newsList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* NOTIFICAÇÃO FLUTUANTE (TOAST) */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="text-xs sm:text-sm font-semibold">
            {notification.message}
          </span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-80 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* TOPO: PESQUISA, CONTADOR E BOTÃO ADICIONAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar notícia pelo título ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 shadow-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 shadow-sm flex items-center justify-center gap-2 select-none">
            <span>Total de notícias:</span>
            <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-red-100">
              {newsList.length}
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 cursor-pointer hover:bg-red-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Publicar Notícia
          </button>
        </div>
      </div>

      {/* ESTADO DE CARREGAMENTO */}
      {isLoading && (
        <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
          <Loader2 className="animate-spin text-red-600" size={28} />
          <span>A carregar feed de notícias...</span>
        </div>
      )}

      {/* GRID DE NOTÍCIAS */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredNews.map((item) => (
            <div
              key={item._id}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Imagem da Notícia */}
              <div className="relative w-full aspect-video mb-4 overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={`Imagem da notícia: ${item.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder.png";
                    }}
                  />
                ) : (
                  <Newspaper size={40} className="text-slate-300" />
                )}
              </div>

              {/* Título e Resumo */}
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4">
                  {item.content}
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                <button
                  onClick={() => setViewingNews(item)}
                  title="Ler Notícia Completa"
                  className="flex items-center justify-center py-2.5 cursor-pointer rounded-xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() => openEditModal(item)}
                  title="Editar Notícia"
                  className="flex items-center justify-center py-2.5 cursor-pointer rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Edit2 size={18} />
                </button>

                <button
                  onClick={() => setDeletingNews(item)}
                  title="Eliminar Notícia"
                  className="flex items-center justify-center py-2.5 cursor-pointer rounded-xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredNews.length === 0 && (
        <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed">
          Nenhuma notícia encontrada.
        </div>
      )}

      {/* MODAL LER NOTÍCIA COMPLETA (PAINEL ADMIN) */}
      {viewingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal (Fixo) */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start gap-4 shrink-0">
              <div>
                <span className="inline-block px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2">
                  Gestão de Notícias
                </span>
                <h3 className="text-lg font-bold leading-snug">
                  {viewingNews.title}
                </h3>
                {viewingNews.createdAt && (
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      Publicado em {formatDate(viewingNews.createdAt)}
                    </span>
                    {viewingNews.author && (
                      <span className="italic text-slate-300">
                        • Autor: {viewingNews.author}
                      </span>
                    )}
                    {viewingNews.updatedAt &&
                      new Date(viewingNews.updatedAt).getTime() >
                        new Date(viewingNews.createdAt || 0).getTime() + 1000 && (
                        <span className="italic text-slate-400">
                          • Atualizado em {formatDate(viewingNews.updatedAt)}
                        </span>
                      )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setViewingNews(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Corpo com Scroll Interno (Rolável) */}
            <div className="overflow-y-auto flex-1">
              {/* Imagem em destaque */}
              {viewingNews.imageUrl && (
                <div className="w-full h-64 bg-slate-100 overflow-hidden">
                  <img
                    src={getImageUrl(viewingNews.imageUrl)}
                    alt={viewingNews.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder.png";
                    }}
                  />
                </div>
              )}

              {/* Corpo do Texto */}
              <div className="p-6">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {viewingNews.content}
                </p>
              </div>
            </div>

            {/* Rodapé do Modal (Fixo) */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setViewingNews(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR NOTÍCIA */}
      {(isAddModalOpen || editingNews) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editingNews ? "Editar Notícia" : "Publicar Nova Notícia"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl cursor-pointer bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveNews}>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Imagem de Capa */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Imagem de Destaque {editingNews && "(Opcional)"}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                      {imageFile ? (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      ) : editingNews?.imageUrl ? (
                        <img
                          src={getImageUrl(editingNews.imageUrl)}
                          className="w-full h-full object-cover"
                          alt="Preview Atual"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/placeholder.png";
                          }}
                        />
                      ) : (
                        <ImageIcon size={24} />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer transition-all"
                    />
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Título da Notícia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Grande Encontro da Juventude no Próximo Sábado"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800"
                  />
                </div>

                {/* Conteúdo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Conteúdo da Notícia *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Escreva os detalhes da notícia..."
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 resize-none"
                  />
                </div>

                {/* Autor da Notícia */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Autor da Notícia *
                  </label>
                  <select
                    required
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="" disabled>
                      Selecione o autor da notícia...
                    </option>
                    <optgroup label="Geral" className="bg-slate-100 font-bold">
                      <option value="Geral" className="bg-white">
                        Geral
                      </option>
                    </optgroup>
                    <optgroup label="Corpos" className="bg-slate-100 font-bold">
                      <option value="Corpo Executivo" className="bg-white">
                        Corpo Executivo
                      </option>
                      <option value="Corpo Diretivo" className="bg-white">
                        Corpo Diretivo
                      </option>
                    </optgroup>
                    <optgroup
                      label="Comissões de Trabalho"
                      className="bg-slate-100 font-bold"
                    >
                      <option
                        value="Comissão de Informação e Comunicação"
                        className="bg-white"
                      >
                        Comissão de Informação e Comunicação
                      </option>
                      <option
                        value="Comissão de Evangelismo"
                        className="bg-white"
                      >
                        Comissão de Evangelismo
                      </option>
                      <option
                        value="Comissão de Cultura"
                        className="bg-white"
                      >
                        Comissão de Cultura
                      </option>
                      <option
                        value="Comissão de Fraternidade e Ecumenismo"
                        className="bg-white"
                      >
                        Comissão de Fraternidade e Ecumenismo
                      </option>
                      <option
                        value="Comissão de Assuntos Sociais e Comunitários"
                        className="bg-white"
                      >
                        Comissão de Assuntos Sociais e Comunitários
                      </option>
                      <option
                        value="Comissão de Recreação e Desporto"
                        className="bg-white"
                      >
                        Comissão de Recreação e Desporto
                      </option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 rounded-xl cursor-pointer bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 className="animate-spin" size={14} />
                  )}
                  Publicar Notícia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO DE ELIMINAÇÃO */}
      {deletingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">
              Eliminar Notícia
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tens a certeza que desejas eliminar{" "}
              <span className="font-bold text-slate-700">
                "{deletingNews.title}"
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingNews(null)}
                className="w-full py-3 rounded-xl cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteNews}
                className="w-full py-3 rounded-xl cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="animate-spin" size={14} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}