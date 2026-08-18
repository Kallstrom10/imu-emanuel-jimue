"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  X,
  User,
  Users,
  Info,
  Phone,
  MapPin,
  Mail,
  ArrowRight,
  Clock,
} from "lucide-react";

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MemberItem {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  commission?: string;
  photoUrl?: string;
  imageUrl?: string;
  profilePhoto?: string;
}

// Relação fixa das 15 comissões
const NOMES_COMISSOES = [
  "Comissão de Informação e Comunicação",
  "Comissão de Evangelismo",
  "Comissão de Cultura",
  "Comissão de Fraternidade e Ecumenismo",
  "Comissão de Assuntos Sociais e Comunitários",
  "Comissão de Recreação e Desporto"
];

// Cargos permitidos no Corpo Executivo
const CARGOS_EXECUTIVO = [
  "diretor",
  "diretora",
  "vice-diretor",
  "vice-diretora",
  "secretário executivo",
  "secretária executiva",
  "tesoureiro",
  "tesoureira",
];

// Cargos permitidos no Corpo Diretivo
const CARGOS_DIRETIVO = [
  "secretário",
  "secretária",
  "vice-secretário",
  "vice-secretária",
];

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewingNews, setViewingNews] = useState<NewsItem | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Buscar Notícias e Membros do Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingNews(true);
        const resNews = await fetch(`${API_URL}/news`);
        if (resNews.ok) {
          const dataNews = await resNews.json();
          setNews(dataNews);
        }
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      } finally {
        setIsLoadingNews(false);
      }

      try {
        setIsLoadingMembers(true);
        const resMembers = await fetch(`${API_URL}/members`);
        if (resMembers.ok) {
          const dataMembers = await resMembers.json();
          setMembers(dataMembers);
        }
      } catch (error) {
        console.error("Erro ao carregar membros:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchData();
  }, []);

  // Avanço automático do carrossel a cada 2 segundos
  useEffect(() => {
    if (news.length <= 1 || viewingNews || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [news.length, viewingNews, isHovered]);

  const handlePrevNews = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const handleNextNews = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data N/D";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  // Filtragem de Membros Executivos
  const corpoExecutivo = members.filter((membro) => {
    const roleLower = membro.role?.toLowerCase().trim() || "";
    return CARGOS_EXECUTIVO.includes(roleLower);
  });

  // Filtragem e Agrupamento dos Membros Diretivos por Comissão
  const getMembrosPorComissao = (nomeComissao: string) => {
    return members.filter((membro) => {
      const roleLower = membro.role?.toLowerCase().trim() || "";
      const isCargoDiretivo = CARGOS_DIRETIVO.includes(roleLower);
      const pertenceAComissao =
        membro.commission?.toLowerCase().trim() === nomeComissao.toLowerCase().trim();
      return isCargoDiretivo && pertenceAComissao;
    });
  };

  const getVisibleNews = () => {
    if (news.length === 0) return [];
    if (news.length === 1) return [{ item: news[0], position: "center" }];
    if (news.length === 2) {
      return [
        { item: news[(currentIndex - 1 + news.length) % news.length], position: "left" },
        { item: news[currentIndex], position: "center" },
      ];
    }

    const prevIndex = (currentIndex - 1 + news.length) % news.length;
    const nextIndex = (currentIndex + 1) % news.length;

    return [
      { item: news[prevIndex], position: "left" },
      { item: news[currentIndex], position: "center" },
      { item: news[nextIndex], position: "right" },
    ];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 scroll-smooth pt-20">
      
      {/* SEÇÃO HERO: BEM-VINDO */}
      <section id="inicio" className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
            Plataforma Oficial
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
            Bem-vindo à <span className="text-red-600">JIMUE</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Juventude da Igreja Metodista Unida de Emanuel. Unindo corações, fortalecendo a fé e edificando líderes para o futuro.
          </p>
        </div>
      </section>

      {/* SEÇÃO 1: JIMUE (CORPO EXECUTIVO E DIRETIVO DINÂMICOS) */}
      <section id="jimue" className="py-20 bg-white border-y border-slate-100 scroll-mt-17">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <Users className="text-red-600" size={28} />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600 uppercase tracking-wide">
              JIMUE - Estrutura Organizacional
            </h2>
          </div>

          {/* CORPO EXECUTIVO */}
          <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm mb-16">
            <h3 className="text-xl font-black text-center text-slate-800 uppercase tracking-wider mb-8 pb-3 border-b border-slate-200">
              Corpo Executivo
            </h3>

            {isLoadingMembers ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                A carregar membros do Corpo Executivo...
              </div>
            ) : corpoExecutivo.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum membro registrado no Corpo Executivo.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {corpoExecutivo.map((membro) => {
                  const foto = membro.imageUrl || membro.photoUrl || membro.profilePhoto;
                  return (
                    <div
                      key={membro._id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 text-center flex flex-col items-center hover:shadow-md transition-all"
                    >
                      <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-red-500 mb-4 overflow-hidden flex items-center justify-center text-slate-400">
                        {foto ? (
                          <img
                            src={foto}
                            alt={`${membro.firstName} ${membro.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={40} />
                        )}
                      </div>
                      <h4 className="font-extrabold text-red-600 text-base">
                        {membro.firstName} {membro.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {membro.role}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CORPO DIRETIVO */}
          <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-center text-slate-800 uppercase tracking-wider mb-12 pb-3 border-b border-slate-200">
              Corpo Diretivo
            </h3>

            {isLoadingMembers ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                A carregar comissões do Corpo Diretivo...
              </div>
            ) : (
              <div className="space-y-12">
                {NOMES_COMISSOES.map((comissaoNome, idx) => {
                  const membrosComissao = getMembrosPorComissao(comissaoNome);
                  return (
                    <div key={idx} className="space-y-4">
                      <h4 className="text-sm font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        {comissaoNome}
                      </h4>

                      {membrosComissao.length === 0 ? (
                        <p className="text-xs text-slate-400 italic pl-4">
                          Sem membros registrados nesta comissão.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {membrosComissao.slice(0, 4).map((membro) => {
                            const foto = membro.imageUrl || membro.photoUrl || membro.profilePhoto;
                            return (
                              <div
                                key={membro._id}
                                className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-red-200 transition-all"
                              >
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 shrink-0 overflow-hidden flex items-center justify-center border border-red-100">
                                  {foto ? (
                                    <img
                                      src={foto}
                                      alt={`${membro.firstName} ${membro.lastName}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User size={20} />
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <h5 className="font-bold text-red-600 text-xs truncate">
                                    {membro.firstName} {membro.lastName}
                                  </h5>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    {membro.role}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: NOTÍCIAS */}
      <section id="noticias" className="py-20 container mx-auto px-6 overflow-hidden scroll-mt-17">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div className="flex items-center gap-3">
            <Newspaper className="text-red-600" size={28} />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600 uppercase tracking-wide">
              Notícias
            </h2>
          </div>
          <Link
            href="/noticias"
            className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors bg-white hover:bg-red-50 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <span>Ver todas as notícias</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Carrossel de Notícias */}
        {isLoadingNews ? (
          <div className="py-20 text-center text-slate-400">A carregar notícias...</div>
        ) : news.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            Nenhuma notícia publicada de momento.
          </div>
        ) : (
            <div 
              className="relative max-w-5xl mx-auto flex items-center justify-center min-h-[420px]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
            {/* Botão Anterior */}
            <button
              onClick={handlePrevNews}
              className="absolute left-0 z-30 p-3 bg-white/90 shadow-xl border border-slate-200 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Grid 3D de Cards */}
            <div className="flex items-center justify-center gap-4 w-full px-12 overflow-visible">
              {getVisibleNews().map(({ item, position }) => {
                const isCenter = position === "center";
                return (
                  <div
                    key={item._id}
                    className={`transition-all duration-700 ease-in-out flex flex-col bg-white rounded-3xl border shadow-md overflow-hidden ${
                      isCenter
                        ? "w-full max-w-sm sm:max-w-md scale-105 z-20 border-red-500 shadow-red-500/10 shadow-2xl"
                        : "hidden md:flex w-full max-w-xs scale-90 opacity-60 z-10 border-slate-200 blur-[0.5px]"
                    }`}
                  >
                    <div className="relative w-full aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Newspaper size={40} className="text-slate-300" />
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 text-base line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed">
                        {item.content}
                      </p>

                      {isCenter && (
                        <button
                          onClick={() => setViewingNews(item)}
                          className="mt-auto w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Eye size={16} /> Ler notícia completa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botão Próximo */}
            <button
              onClick={handleNextNews}
              className="absolute right-0 z-30 p-3 bg-white/90 shadow-xl border border-slate-200 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </section>

      {/* SEÇÃO 3: SOBRE NÓS */}
      <section id="sobre" className="py-20 bg-white border-y scroll-mt-17 border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <Info className="text-red-600" size={28} />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600 uppercase tracking-wide">
              Sobre Nós
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Imagem do lado esquerdo */}
            <div className="w-full aspect-video sm:aspect-square max-h-[400px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
              <img
                src="/foto-jimue.jpg"
                alt="Sobre a JIMUE"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            {/* Texto do lado direito */}
            <div className="space-y-5 text-slate-600 text-sm sm:text-base leading-relaxed">
              <h3 className="text-2xl font-bold text-slate-900">
                Unindo Jovens, Transformando Vidas.
              </h3>
              <p>
                A JIMUE (Juventude da Igreja Metodista Unida em Angola) é uma organização cristã dedicada ao crescimento espiritual, social e intelectual dos jovens. O nosso objetivo é capacitar a juventude para vivenciar os valores do Evangelho e ser um agente de transformação na sociedade.
              </p>
              <p>
                Através de encontros, conferências, ações sociais e programas comunitários, criamos um ambiente saudável onde cada jovem encontra o seu propósito e desenvolve o seu potencial de liderança.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: CONTACTOS */}
      <section id="contactos" className="py-20 scroll-mt-17 container mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <Phone className="text-red-600" size={28} />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600 uppercase tracking-wide">
            Contactos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card Telefone */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-red-200 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
              <Phone size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Telefones</h3>
            <p className="text-slate-500 text-xs sm:text-sm">+244 934 139 667</p>
            <p className="text-slate-500 text-xs sm:text-sm">+244 990 000 000</p>
          </div>

          {/* Card Localização */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-red-200 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
              <MapPin size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Localização</h3>
            <p className="text-slate-500 text-xs sm:text-sm">Rangel, Rua do Paraná</p>
            <p className="text-slate-500 text-xs sm:text-sm">Luanda - Angola</p>
          </div>

          {/* Card Emails */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-red-200 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
              <Mail size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">E-mails</h3>
            <p className="text-slate-500 text-xs sm:text-sm">alfanioantonio4@gmail.com</p>
            <p className="text-slate-500 text-xs sm:text-sm">rodsonp521@gmail.com</p>
          </div>
        </div>
      </section>

      {/* MODAL LER NOTÍCIA COMPLETA (PÁGINA INICIAL) */}
      {viewingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabeçalho do Modal (Fixo) */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start gap-4 shrink-0">
              <div>
                <span className="inline-block px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2">
                  Notícia JIMUE
                </span>
                <h3 className="text-lg font-bold leading-snug">{viewingNews.title}</h3>
                {viewingNews.createdAt && (
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      Publicado em {formatDate(viewingNews.createdAt)} 
                    </span>
                    {viewingNews.updatedAt &&
                      new Date(viewingNews.updatedAt).getTime() > new Date(viewingNews.createdAt || 0).getTime() + 1000 && (
                        <span className="italic text-slate-400 ml">
                          <span className="mr-2">•</span> Atualizado em {formatDate(viewingNews.updatedAt)}
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
                    src={viewingNews.imageUrl}
                    alt={viewingNews.title}
                    className="w-full h-full object-cover"
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

      {/* RODAPÉ */}
      <footer className="bg-black text-white pt-16 pb-8 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-12 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-lg">
                <img
                  src="/JIMUE-logo.jpg"
                  alt="Logo JIMUE"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="text-2xl font-black tracking-widest text-white">JIMUE</span>
            </div>

            <p className="text-slate-400 text-xs max-w-md text-center md:text-right leading-relaxed">
              Juventude da Igreja Metodista Unida de Emanuel. Vivenciando a fé e transformando o futuro.
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p className="text-center sm:text-left">
              Todos os direitos reservados - &copy; JIMUE 2026
            </p>
            <p className="font-serif italic text-red-500 tracking-wider text-sm font-bold">
              Design by RD10
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}