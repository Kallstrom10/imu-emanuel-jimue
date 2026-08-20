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
  X,
  ExternalLink,
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
  const { user, token, isLoading: isAuthLoading } = useAuth() as any;
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<{ [key: string | number]: number }>({});
  const [hoverRatings, setHoverRatings] = useState<{ [key: string | number]: number }>({});
  const [showAccessModal, setShowAccessModal] = useState(false);
  
  // Estado para controlar o livro que está a ser lido no ecrã imersivo
  const [readingBook, setReadingBook] = useState<Book | null>(null);

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
  }, [API_URL]);

  // 2. Avaliar um livro (1 a 5 estrelas)
  const handleRateBook = async (bookId: string | number, selectedRating: number) => {
    // Atualização local imediata da escolha do utilizador
    setUserRatings((prev) => ({ ...prev, [bookId]: selectedRating }));

    try {
      const response = await fetch(`${API_URL}/books/${bookId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rating: selectedRating,
          userId: user?.id || user?._id,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();

        // Se o backend retornar os dados atualizados do livro, atualiza o estado local
        if (updatedData) {
          setBooks((prevBooks) =>
            prevBooks.map((b) => {
              const bKey = b.id || b._id;
              if (bKey === bookId) {
                return {
                  ...b,
                  rating: updatedData.rating ?? updatedData.averageRating ?? b.rating,
                  totalRatings: updatedData.totalRatings ?? b.totalRatings,
                };
              }
              return b;
            })
          );
        }
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    }
  };

  // Carregar as avaliações prévias do utilizador logado
useEffect(() => {
  async function fetchUserRatings() {
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/books/user-ratings/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserRatings(data); // Preenche o estado com as notas já gravadas no DB
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações do utilizador:", error);
    }
  }

  fetchUserRatings();
}, [user, API_URL]);

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

      {/* LEITOR IMERSIVO DE PDF (MODAL/OVERLAY FULLSCREEN) */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200">
          {/* Barra de Ferramentas / Header do Leitor */}
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
              {/* Botão de abrir em nova aba como opção secundária */}
              <a
                href={`https://docs.google.com/gview?url=${encodeURIComponent(readingBook.pdfUrl)}&embedded=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                title="Abrir em separador externo"
              >
                <ExternalLink size={15} />
                <span>Abrir externa</span>
              </a>

              {/* Botão de Fechar */}
              <button
                onClick={() => setReadingBook(null)}
                className="p-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Fechar leitor"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Área Principal de Exibição do PDF */}
          <div className="flex-1 w-full bg-slate-900 relative">
            <iframe
              src={readingBook.pdfUrl}
              title={readingBook.title}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* ================= CABEÇALHO / NAVBAR ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Canto Esquerdo: Voltar para o Site */}
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 text-xs sm:text-sm font-bold transition-colors group"
          >
            <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-red-50 text-slate-600 group-hover:text-red-600 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span>Voltar para o site</span>
          </Link>

          {/* Canto Direito: Barra de Pesquisa */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
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
              const bookKey = book.id || book._id;
              const currentRating = userRatings[bookKey] || 0;
              const activeRating = hoverRatings[bookKey] || currentRating;

              return (
                <div
                  key={bookKey}
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
                      <h3 className="font-bold text-slate-900 line-clamp-2 text-base">
                        {book.title}
                      </h3>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Avaliação em Estrelas (1 a 5) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-slate-400 block">
                            Sua Avaliação
                          </span>
                          {book.rating !== undefined && book.rating > 0 && (
                            <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                              ★ {Number(book.rating).toFixed(1)}
                              {book.totalRatings ? ` (${book.totalRatings})` : ""}
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-1"
                          onMouseLeave={() =>
                            setHoverRatings((prev) => ({ ...prev, [bookKey]: 0 }))
                          }
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRateBook(bookKey, star)}
                              onMouseEnter={() =>
                                setHoverRatings((prev) => ({ ...prev, [bookKey]: star }))
                              }
                              className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                              title={`Avaliar com ${star} estrela(s)`}
                            >
                              <Star
                                size={18}
                                className={
                                  star <= activeRating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 fill-slate-100"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Botão Ler Livro (Abre Leitor Imersivo em iframe) */}
                      <button
                        onClick={() => setReadingBook(book)}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm shadow-red-500/20 cursor-pointer"
                      >
                        <BookOpen size={16} />
                        <span>Ler livro</span>
                      </button>
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