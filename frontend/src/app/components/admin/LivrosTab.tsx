"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Star,
  BookOpen,
  ExternalLink,
  X,
  Image as ImageIcon,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { PdfViewer } from "../PDFViwer";

// 1. Tipagem do Livro vindo do MongoDB
interface Book {
  _id: string;
  title: string;
  coverUrl: string;
  pdfUrl: string;
  rating?: number;
  totalRatings?: number;
}

interface Notification {
  type: "success" | "error";
  message: string;
}

export default function LivrosTab() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notificações de Feedback (Sucesso / Falha)
  const [notification, setNotification] = useState<Notification | null>(null);

  // Estados para os Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  // Estados dos Campos do Formulário
  const [titleInput, setTitleInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Estado para controlar o livro que está a ser lido no ecrã imersivo
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  // Função para exibir mensagem temporária
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Buscar livros do Backend
  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/books`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      } else {
        console.error("Erro ao procurar livros do backend");
      }
    } catch (error) {
      console.error("Erro de conexão ao carregar livros:", error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Preencher ou limpar campos do formulário ao abrir modal
  const openAddModal = () => {
    setEditingBook(null);
    setTitleInput("");
    setCoverFile(null);
    setPdfFile(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setTitleInput(book.title);
    setCoverFile(null);
    setPdfFile(null);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingBook(null);
    setTitleInput("");
    setCoverFile(null);
    setPdfFile(null);
  };

  // Submeter Formulário (Criar ou Editar)
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      showNotification("error", "O título do livro é obrigatório!");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", titleInput);

      if (coverFile) formData.append("cover", coverFile);
      if (pdfFile) formData.append("pdf", pdfFile);

      let res: Response;

      if (editingBook) {
        // Atualizar livro existente
        res = await fetch(`${API_URL}/books/${editingBook._id}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        // Criar novo livro
        res = await fetch(`${API_URL}/books`, {
          method: "POST",
          body: formData,
        });
      }

      if (res.ok) {
        closeModal();
        fetchBooks(); // Atualiza a lista automaticamente
        showNotification(
          "success",
          editingBook
            ? "Livro atualizado com sucesso!"
            : "Novo livro adicionado com sucesso!"
        );
      } else {
        const errData = await res.json();
        showNotification(
          "error",
          errData.message || "Erro ao guardar o livro."
        );
      }
    } catch (error) {
      console.error("Erro ao guardar livro:", error);
      showNotification("error", "Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Executar a eliminação do livro
  const confirmDeleteBook = async () => {
    if (!deletingBook) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${API_URL}/books/${deletingBook._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b._id !== deletingBook._id));
        showNotification("success", "Livro eliminado com sucesso!");
      } else {
        showNotification("error", "Erro ao eliminar o livro.");
      }
    } catch (error) {
      console.error("Erro ao eliminar livro:", error);
      showNotification("error", "Erro ao conectar com o servidor.");
    } finally {
      setIsDeleting(false);
      setDeletingBook(null);
    }
  };

  // Filtro de pesquisa
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Componente de Estrelas, Média e Total de Avaliações
  const RenderStars = ({
    rating = 0,
    totalRatings = 0,
  }: {
    rating?: number;
    totalRatings?: number;
  }) => {
    const formattedRating = Number(rating).toFixed(1);

    return (
      <div className="flex flex-col items-center gap-1.5 my-3">
        {/* Estrelas do livro */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={`${
                star <= Math.round(rating)
                  ? "text-red-500 fill-red-500"
                  : "text-slate-200 fill-slate-100 dark:text-slate-700 dark:fill-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Média Numérica e Contagem de Avaliações */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formattedRating}
          </span>
          <span>•</span>
          <span>
            {totalRatings}{" "}
            {totalRatings === 1 ? "avaliação" : "avaliações"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* MENSAGEM DE NOTIFICAÇÃO FLUTUANTE */}
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

      {/* LEITOR IMERSIVO DE PDF */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 shadow-md shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-red-600/20 text-red-500 rounded-xl shrink-0">
                <BookOpen size={20} />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-xs sm:text-sm text-white truncate max-w-xs sm:max-w-md">
                  {readingBook.title}
                </h3>
                <p className="text-[11px] text-slate-400">Leitor Imersivo JIMUE</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={readingBook.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                title="Abrir em separador externo"
              >
                <ExternalLink size={15} />
                <span>Abrir externa</span>
              </a>

              <button
                onClick={() => setReadingBook(null)}
                className="p-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Fechar leitor"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
            <PdfViewer url={readingBook.pdfUrl} />
          </div>
        </div>
      )}

      {/* TOPO: Pesquisa e Botão Adicionar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar livro pelo título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm flex items-center justify-center gap-2 select-none">
            <span>Total de livros:</span>
            <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-red-100 dark:border-red-900/50">
              {books.length}
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 cursor-pointer hover:bg-red-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Adicionar Livro
          </button>
        </div>
      </div>

      {/* Carregamento */}
      {isLoading && (
        <div className="flex justify-center items-center py-20 text-slate-400 dark:text-slate-500 gap-3">
          <Loader2 className="animate-spin text-red-600" size={28} />
          <span>A carregar acervo de livros...</span>
        </div>
      )}

      {/* GRID DE LIVROS */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Capa do Livro */}
              <div className="relative w-full aspect-[3/4] mb-4 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={book.coverUrl || "https://placehold.co/400x600?text=Sem+Capa"}
                  alt={`Capa do livro ${book.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Título, Média e Total de Avaliações */}
              <div className="flex-1 flex flex-col items-center text-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-6 leading-tight">
                  {book.title}
                </h3>
                <RenderStars
                  rating={book.rating}
                  totalRatings={book.totalRatings}
                />
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setReadingBook(book)}
                  title="Ler Livro (PDF)"
                  className="flex items-center justify-center py-2.5 cursor-pointer rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() => openEditModal(book)}
                  title="Editar Livro"
                  className="flex items-center justify-center py-2.5 cursor-pointer rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Edit2 size={18} />
                </button>

                <button
                  onClick={() => setDeletingBook(book)}
                  title="Eliminar Livro"
                  className="flex items-center justify-center py-2.5 cursor-pointer rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredBooks.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/60 dark:border-slate-800 max-w-md mx-auto">
          <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhum livro encontrado</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Não foram encontrados livros correspondentes à sua pesquisa.
          </p>
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR LIVRO */}
      {(isAddModalOpen || editingBook) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 flex justify-between items-center border-b dark:border-slate-800">
              <h3 className="text-lg font-bold">
                {editingBook ? "Editar Livro" : "Adicionar Novo Livro"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl cursor-pointer bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBook}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Capa do Livro {editingBook && "(Deixe vazio para manter a atual)"}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 overflow-hidden">
                      {coverFile ? (
                        <img
                          src={URL.createObjectURL(coverFile)}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      ) : (
                        <ImageIcon size={24} />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 file:cursor-pointer transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ficheiro PDF {editingBook && "(Deixe vazio para manter o atual)"}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                      <FileText size={24} />
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 file:cursor-pointer transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Título do Livro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: A Arte da Guerra"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                  Guardar Livro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE ELIMINAÇÃO */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              Eliminar Livro
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Tens a certeza que desejas eliminar{" "}
              <span className="font-bold text-slate-700 dark:text-slate-200">
                "{deletingBook.title}"
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingBook(null)}
                className="w-full py-3 rounded-xl cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteBook}
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