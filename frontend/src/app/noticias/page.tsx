"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Calendar, Newspaper, X, Clock, ChevronRight } from "lucide-react";

interface NewsItem {
  id: string | number;
  _id: string | number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Carregamento dinâmico de dados da API
  useEffect(() => {
    async function fetchNews() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/news`);

        if (!res.ok) {
          throw new Error("Erro ao buscar as notícias da API");
        }

        const data: NewsItem[] = await res.json();
        setNews(data);
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, [API_URL]);

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

  // Filtragem de notícias por título ou conteúdo
  const filteredNews = useMemo(() => {
    if (!searchTerm.trim()) return news;

    const term = searchTerm.toLowerCase();
    return news.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.content.toLowerCase().includes(term)
    );
  }, [news, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col font-sans">
      
      {/* topo: Navegação e Barra de Pesquisa */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Canto Esquerdo: Voltar para o Site */}
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 text-xs sm:text-sm font-bold transition-colors group"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-red-50 dark:group-hover:bg-red-900/30 text-slate-600 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span>Voltar para o site</span>
          </Link>

          {/* Canto Direito: Barra de Pesquisa */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar por título ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
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
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
        
        {/* Título da Página */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold mb-3 border border-red-100 dark:border-red-500/20 transition-colors">
            <Newspaper size={14} />
            <span>Informa-te & Acompanha</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">
            Notícias e Atualizações
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl transition-colors">
            Fica por dentro de todas as atividades, eventos e comunicados oficiais da juventude JIMUE.
          </p>
        </div>

        {/* Estado de Carregamento */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-medium text-xs sm:text-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-3"></div>
            <p>A carregar notícias...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          /* Estado Vazio */
          <div className="py-20 text-center bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-8 transition-colors">
            <Newspaper className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhuma notícia encontrada</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {searchTerm ? "Tenta pesquisar por outros termos." : "Não há notícias publicadas no momento."}
            </p>
          </div>
        ) : (
          /* Grelha de Notícias */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item, index) => (
              <article
                key={item._id || item.id || index}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 group"
              >
                {/* Imagem do Card */}
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-slate-800/50 text-red-400 dark:text-red-500/50">
                      <Newspaper size={40} />
                    </div>
                  )}
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Data / Autor */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-400 font-medium mb-2">
                      {item.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                        </span>
                      )}
                      {item.author && (
                        <>
                          <span>•</span>
                          <span>{item.author}</span>
                        </>
                      )}
                    </div>

                    {/* Título */}
                    <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-6 mb-2">
                      {item.title}
                    </h2>

                    {/* Resumo */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {/* Botão Ler Notícia Completa */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => setSelectedNews(item)}
                      className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-red-600 dark:hover:bg-red-600 text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-600 hover:border-red-600 dark:hover:border-red-600"
                    >
                      <span>Ler notícia completa</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ================= MODAL DE LEITURA DA NOTÍCIA ================= */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabeçalho do Modal (Fixo) */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 flex justify-between items-start gap-4 shrink-0">
              <div>
                <span className="inline-block px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2">
                  Notícia JIMUE
                </span>
                <h3 className="text-lg font-bold leading-snug">{selectedNews.title}</h3>
                {selectedNews.createdAt && (
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      Publicado em {formatDate(selectedNews.createdAt)} 
                    </span>
                    {selectedNews.updatedAt &&
                      new Date(selectedNews.updatedAt).getTime() > new Date(selectedNews.createdAt || 0).getTime() + 1000 && (
                        <span className="italic text-slate-400 ml-1">
                          <span className="mr-2">•</span> Atualizado em {formatDate(selectedNews.updatedAt)}
                        </span>
                      )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Corpo com Scroll Interno */}
            <div className="overflow-y-auto flex-1">
              {/* Imagem em destaque */}
              {selectedNews.imageUrl && (
                <div className="w-full h-64 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={selectedNews.imageUrl}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Corpo do Texto */}
              <div className="p-6">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedNews.content}
                </p>
              </div>
            </div>

            {/* Rodapé do Modal (Fixo) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end shrink-0 transition-colors">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé Simples */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500 mt-auto transition-colors duration-300">
        &copy; {new Date().getFullYear()} Juventude da Igreja Metodista Unida de Emanuel (JIMUE). Todos os direitos reservados.
      </footer>
    </div>
  );
}