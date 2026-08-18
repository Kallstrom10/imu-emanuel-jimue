"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Star,
  Loader2,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Interface para a estrutura do Livro
export interface Book {
  id: string | number;
  _id: string | number;
  title: string;
  coverUrl?: string;
  pdfUrl: string;
  rating?: number; // Média de avaliação (1 a 5)
  totalRatings?: number;
}

export default function BibliotecaPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<{ [key: string | number]: number }>({});
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Verificação de Autenticação (Apenas utilizadores logados)
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        setShowAccessModal(true);
      }
    }
  }, [user, isAuthLoading]);

  // Redirecionamento ao clicar no botão do modal
  const handleRedirectHome = () => {
    router.push("/");
  };

  // 1. Procurar livros no backend
  useEffect(() => {
    async function fetchBooks() {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/books`);
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        } else {
          console.error("Erro ao carregar livros da API");
        }
      } catch (error) {
        console.error("Erro na requisição dos livros:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooks();
  }, []);

  // 2. Avaliar um livro (1 a 5 estrelas)
  const handleRateBook = async (bookId: string | number, selectedRating: number) => {
    // Atualização local imediata para feedback rápido do utilizador
    setUserRatings((prev) => ({ ...prev, [bookId]: selectedRating }));

    try {
      await fetch(`${API_URL}/books/${bookId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selectedRating }),
      });
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    }
  };

  // 3. Filtragem de livros pelo título
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enquanto valida a autenticação, exibe um ecrã de carregamento
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 font-sans pb-12 relative">
      {/* MODAL DE ACESSO RESTRITO */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 transform transition-all">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Acesso Restrito
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Precisa de iniciar sessão para aceder à biblioteca digital.
            </p>
            <button
              onClick={handleRedirectHome}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer shadow-lg shadow-red-500/30"
            >
              Voltar à Página Inicial
            </button>
          </div>
        </div>
      )}

      {/* ================= CABEÇALHO / NAVBAR ================= */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Canto Superior Esquerdo: Botão Voltar */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium text-sm shrink-0"
          >
            <ArrowLeft size={18} />
            <span>Voltar à página inicial</span>
          </Link>

          {/* Canto Superior Direito: Barra de Pesquisa */}
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Pesquisar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-transparent focus:border-red-500 focus:bg-white text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>

        </div>
      </header>

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Biblioteca Digital
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Explore, avalie e leia o acervo de livros em PDF da JIMUE.
          </p>
        </div>

        {/* ECRÃ DE CARREGAMENTO */}
        {isLoading ? (
          <div className="h-64 w-full flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={36} className="animate-spin text-red-600" />
            <p className="text-sm font-medium">A carregar livros da biblioteca...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          /* NENHUM LIVRO ENCONTRADO */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 max-w-md mx-auto">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Nenhum livro encontrado</h3>
            <p className="text-sm text-slate-500 mt-1">
              Não foram encontrados livros correspondentes à sua pesquisa.
            </p>
          </div>
        ) : (
          /* GRID DE CARDS DOS LIVROS */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const currentRating = userRatings[book.id] || book.rating || 0;

              return (
                <div
                  key={book.id || book._id}
                  className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200"
                >
                  {/* Capa do Livro */}
                  <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 gap-2 p-4 text-center">
                        <FileText size={40} className="text-slate-300" />
                        <span className="text-xs font-medium">Sem imagem de capa</span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1 text-base">
                        {book.title}
                      </h3>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Avaliação em Estrelas (1 a 5) */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Sua Avaliação
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRateBook(book.id, star)}
                              className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                              title={`Avaliar com ${star} estrela(s)`}
                            >
                              <Star
                                size={18}
                                className={
                                  star <= currentRating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 fill-slate-100"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Botão Ler Livro (Abre PDF em nova aba) */}
                      <a
                        href={book.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm shadow-red-500/20"
                      >
                        <BookOpen size={16} />
                        <span>Ler livro</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}