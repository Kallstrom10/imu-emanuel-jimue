"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import {
  Home,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  LogOut,
  Moon,
  Sun,
  User,
  Newspaper,
  Award,
  UserCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import MembrosTab, { Membro } from "@/app/components/admin/MembrosTab";
import LivrosTab from "@/app/components/admin/LivrosTab";
import NoticiasTab from "@/app/components/admin/NoticiasTab";
import { useAuth } from "@/app/context/AuthContext";
import NotificationBell from "../components/admin/Notifications";

// Interface para a tipagem dos dados do Dashboard
interface DashboardData {
  totalJovens: number;
  totalHomens: number;
  totalMulheres: number;
  categorias: {
    efectivos: { total: number; m: number; f: number };
    emProva: { total: number; m: number; f: number };
    catecumenos: { total: number; m: number; f: number };
  };
  batismo: {
    batizados: { total: number; m: number; f: number };
    naoBatizados: { total: number; m: number; f: number };
  };
  classes: Array<{
    name: string;
    total: number;
    m: number;
    f: number;
  }>;
}

export default function AdminDashboard() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [showAccessModal, setShowAccessModal] = useState(false);

  // MUDANÇA NOS TEMAS: CLARO / ESCURO
  const { theme, toggleTheme } = useTheme();

  // Estados para dados do backend e carregamento
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  // const [livros, setLivros] = useState<Livros[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verificação de Acesso Admin
  useEffect(() => {
    if (!isAuthLoading) {
      const u = user?.user || user;
      const rawPhone = u?.phone || u?.telefone || u?.numTelefone || "";
      const cleanPhone = String(rawPhone).replace(/\D/g, "");
      const rawRole = String(u?.role || u?.cargo || "").toLowerCase();

      const isAdmin =
        !!user &&
        (cleanPhone.includes("928246352") ||
          rawRole === "admin" ||
          rawRole === "administrador");

      if (!isAdmin) {
        setShowAccessModal(true);
      }
    }
  }, [user, isAuthLoading]);

  // Redirecionamento ao fechar o modal
  const handleRedirectHome = () => {
    router.push("/");
  };

  // Buscar dados do backend ao carregar a página
  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/admin/dashboard/stats`);
        if (response.ok) {
          const data: DashboardData = await response.json();
          setStats(data);
        } else {
          console.error("Falha ao obter dados da API");
        }
      } catch (error) {
        console.error("Erro ao procurar estatísticas:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  // 1. Função única para carregar os dados de cada página
  const loadTabData = async (tab: string) => {
    setIsLoading(true);
    try {
      if (tab === "inicio") {
        const res = await fetch(`${API_URL}/admin/dashboard/stats`);
        if (res.ok) setStats(await res.json());
      } else if (tab === "livros") {
        const res = await fetch(`${API_URL}/books`);
        // if (res.ok) setLivros(await res.json());
      }
    } catch (error) {
      console.error(`Erro ao carregar dados da aba ${tab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Função de clique: muda de aba e força o recarregamento imediato
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    loadTabData(tabName);
  };

  // 3. Carregamento inicial ao abrir o painel
  useEffect(() => {
    loadTabData(activeTab);
  }, []);

  // Enquanto valida a autenticação, exibe um ecrã de carregamento
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  // Cálculos dinâmicos gerais (com proteção contra divisão por zero)
  const total = stats?.totalJovens || 0;
  const percentHomens = total > 0 ? ((stats!.totalHomens / total) * 100).toFixed(1) : "0";
  const percentMulheres = total > 0 ? ((stats!.totalMulheres / total) * 100).toFixed(1) : "0";

  // Cálculos de Batismo
  const totalBatizados = stats?.batismo.batizados.total || 0;
  const batizadosMalePct = totalBatizados > 0 ? (stats!.batismo.batizados.m / totalBatizados) * 100 : 0;
  const batizadosFemalePct = totalBatizados > 0 ? (stats!.batismo.batizados.f / totalBatizados) * 100 : 0;

  const totalNaoBatizados = stats?.batismo.naoBatizados.total || 0;
  const naoBatizadosMalePct = totalNaoBatizados > 0 ? (stats!.batismo.naoBatizados.m / totalNaoBatizados) * 100 : 0;
  const naoBatizadosFemalePct = totalNaoBatizados > 0 ? (stats!.batismo.naoBatizados.f / totalNaoBatizados) * 100 : 0;

  // Trata objeto de utilizador simples ou aninhado
  const currentUser = user?.user || user;
  const userInitial = currentUser?.firstName?.[0] || "A";
  const userPhoto = currentUser?.avatarUrl;
  const userFname = currentUser?.firstName || "";
  const userLname = currentUser?.lastName || "";
  const userFirstName = userFname ? userFname.split(" ")[0] : "Admin";
  const userRole = "Administrador";

  return (
    <div className={`h-screen w-full flex bg-[#F0F4F8] dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-200 overflow-hidden relative transition-colors duration-300 ${theme}`}>
      {/* MODAL DE ACESSO NEGADO */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-700 transform transition-all">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Acesso Negado
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Não tem permissão para aceder ao painel de administração. Apenas utilizadores autorizados têm acesso.
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

      {/* ================= BARRA LATERAL FIXA (SIDEBAR) ================= */}
      <aside
        className={`h-full bg-[#0F172A] text-slate-300 flex flex-col justify-between transition-all duration-300 relative z-20 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } p-4 shrink-0 select-none`}
      >
        <div>
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800 mb-6">
            <div className="w-9 h-9 bg-white text-white rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-red-600/30">
              <img
                src="/JIMUE-logo.jpg"
                alt="Logo JIMUE"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-sm font-bold text-white leading-tight truncate">
                  Juventude Emanuelina
                </h2>
                <p className="text-[11px] text-slate-400 truncate">Gestão de Membros</p>
              </div>
            )}
          </div>

          <div
            className={`bg-slate-800/60 rounded-2xl p-3 mb-6 flex items-center ${
              isSidebarCollapsed ? "justify-center" : "gap-3"
            } border border-slate-700/50`}
          >
            <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{userFname} {userLname}</p>
                <p className="text-xs text-slate-400 truncate">{userRole}</p>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => handleTabChange("inicio")}
              className={`w-full flex items-center cursor-pointer gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "inicio"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Home size={20} />
              {!isSidebarCollapsed && <span>Início</span>}
            </button>

            <button
              onClick={() => setActiveTab("membros")}
              className={`w-full flex items-center cursor-pointer gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "membros"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users size={20} />
              {!isSidebarCollapsed && <span>Membros</span>}
            </button>

            <button
              onClick={() => setActiveTab("livros")}
              className={`w-full flex items-center cursor-pointer gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "livros"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen size={20} />
              {!isSidebarCollapsed && <span>Livros</span>}
            </button>

            {/* NOVA ABA: NOTÍCIAS */}
            <button
              onClick={() => setActiveTab("noticias")}
              className={`w-full flex items-center cursor-pointer gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "noticias"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Newspaper size={20} />
              {!isSidebarCollapsed && <span>Notícias</span>}
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-1">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isSidebarCollapsed && <span>Recolher</span>}
          </button>

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            <Globe size={18} />
            {!isSidebarCollapsed && <span>Voltar ao site</span>}
          </Link>

          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Encerrar sessão</span>}
          </button>
        </div>
      </aside>

      {/* ================= ÁREA DE CONTEÚDO PRINCIPAL ================= */}
      <main className="flex-1 h-full overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
              {activeTab === "inicio" && `Olá, ${userFirstName}`}
              {activeTab === "membros" && "Gestão de Membros"}
              {activeTab === "livros" && "Biblioteca & Livros"}
              {activeTab === "noticias" && "Notícias da JIMUE"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
              {activeTab === "inicio" && "Visão geral da Juventude"}
              {activeTab === "membros" && "Consulte, edite e gira os membros da juventude"}
              {activeTab === "livros" && "Gestão do acervo de livros da juventude"}
              {activeTab === "noticias" && "Adicione, gere veja as notícias da JIMUE"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* BOTÃO MUDANÇA DE TEMA */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              className="p-2.5 bg-white cursor-pointer dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200/60 dark:border-slate-700"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* NOTIFICAÇÕES (COMPONENTE DINÂMICO INSERIDO) */}
            <NotificationBell />

            {/* FOTO / AVATAR */}
            <button 
              className="w-10 h-10 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md overflow-hidden"
                onClick={() => {
                router.push("/recuperar-senha");
            }}
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitial
              )}
              
            </button>
          </div>
        </div>

        {/* 1. ABA: INÍCIO (DASHBOARD GERAL) */}
        {activeTab === "inicio" && (
          <>
            {isLoading ? (
              <div className="h-96 w-full flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                <Loader2 size={36} className="animate-spin text-red-600" />
                <p className="text-sm font-medium">A carregar estatísticas do painel...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* CARDS RESUMO DO TOPO */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* TOTAL DE JOVENS */}
                  <div className="bg-[#1E293B] text-white p-6 rounded-2xl shadow-sm flex cursor-pointer flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-3xl font-extrabold tracking-tight">
                          {stats?.totalJovens ?? 0}
                        </span>
                        <p className="text-slate-300 text-xs font-medium mt-1">Total de jovens</p>
                      </div>
                      <div className="p-2.5 bg-white/10 rounded-xl">
                        <Users size={20} className="text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-3 font-medium">
                      <span>♂ {stats?.totalHomens ?? 0}</span>
                      <span>♀ {stats?.totalMulheres ?? 0}</span>
                    </p>
                  </div>

                  {/* EFECTIVOS */}
                  <div className="bg-[#059669] text-white p-6 rounded-2xl cursor-pointer shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-3xl font-extrabold tracking-tight">
                          {stats?.categorias.efectivos.total ?? 0}
                        </span>
                        <p className="text-emerald-100 text-xs font-medium mt-1">Efectivos</p>
                      </div>
                      <div className="p-2.5 bg-white/10 rounded-xl">
                        <UserCheck size={20} className="text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-emerald-200 flex items-center gap-3 font-medium">
                      <span>♂ {stats?.categorias.efectivos.m ?? 0}</span>
                      <span>♀ {stats?.categorias.efectivos.f ?? 0}</span>
                    </p>
                  </div>

                  {/* EM PROVA */}
                  <div className="bg-[#D97706] text-white p-6 rounded-2xl cursor-pointer shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-3xl font-extrabold tracking-tight">
                          {stats?.categorias.emProva.total ?? 0}
                        </span>
                        <p className="text-amber-100 text-xs font-medium mt-1">Em Prova</p>
                      </div>
                      <div className="p-2.5 bg-white/10 rounded-xl">
                        <Award size={20} className="text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-amber-200 flex items-center gap-3 font-medium">
                      <span>♂ {stats?.categorias.emProva.m ?? 0}</span>
                      <span>♀ {stats?.categorias.emProva.f ?? 0}</span>
                    </p>
                  </div>

                  {/* CATECÚMENOS */}
                  <div className="bg-[#2563EB] text-white p-6 rounded-2xl cursor-pointer shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-3xl font-extrabold tracking-tight">
                          {stats?.categorias.catecumenos.total ?? 0}
                        </span>
                        <p className="text-blue-100 text-xs font-medium mt-1">Catecúmenos</p>
                      </div>
                      <div className="p-2.5 bg-white/10 rounded-xl">
                        <BookOpen size={20} className="text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-200 flex items-center gap-3 font-medium">
                      <span>♂ {stats?.categorias.catecumenos.m ?? 0}</span>
                      <span>♀ {stats?.categorias.catecumenos.f ?? 0}</span>
                    </p>
                  </div>
                </div>

                {/* CONTAINER 1: TOTAL DE HOMENS E MULHERES */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700 transition-colors">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5">Total de Moços e Moças</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* MOÇOS */}
                    <div className="bg-[#F8FAFC] dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-600 flex flex-col justify-between transition-colors">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-xs font-medium mb-3">
                        <User size={16} className="text-blue-600" /> Moços
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {stats?.totalHomens ?? 0}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-400 mb-3">
                        Representa {percentHomens}% do total
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-500"
                          style={{ width: `${percentHomens}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* MOÇAS */}
                    <div className="bg-[#F8FAFC] dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-600 flex flex-col justify-between transition-colors">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-xs font-medium mb-3">
                        <User size={16} className="text-red-500" /> Moças
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {stats?.totalMulheres ?? 0}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-400 mb-3">
                        Representa {percentMulheres}% do total
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full transition-all duration-500"
                          style={{ width: `${percentMulheres}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONTAINER 2: BATIZADOS */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700 transition-colors">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5">Batizados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* BATIZADOS */}
                    <div className="bg-[#F8FAFC] dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-600 flex flex-col justify-between transition-colors">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-xs font-medium mb-2">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Batizados
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {stats?.batismo.batizados.total ?? 0}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-3">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          ♂ {stats?.batismo.batizados.m ?? 0}
                        </span>
                        <span className="text-red-500 dark:text-red-400 font-medium">
                          ♀ {stats?.batismo.batizados.f ?? 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-blue-600 h-full transition-all duration-500"
                          style={{ width: `${batizadosMalePct}%` }}
                        ></div>
                        <div
                          className="bg-red-500 h-full transition-all duration-500"
                          style={{ width: `${batizadosFemalePct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* NÃO BATIZADOS */}
                    <div className="bg-[#F8FAFC] dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-600 flex flex-col justify-between transition-colors">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-xs font-medium mb-2">
                        <XCircle size={16} className="text-amber-500" /> Não Batizados
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {stats?.batismo.naoBatizados.total ?? 0}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-3">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          ♂ {stats?.batismo.naoBatizados.m ?? 0}
                        </span>
                        <span className="text-red-500 dark:text-red-400 font-medium">
                          ♀ {stats?.batismo.naoBatizados.f ?? 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-blue-600 h-full transition-all duration-500"
                          style={{ width: `${naoBatizadosMalePct}%` }}
                        ></div>
                        <div
                          className="bg-red-500 h-full transition-all duration-500"
                          style={{ width: `${naoBatizadosFemalePct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONTAINER 3: DISTRIBUIÇÃO POR CLASSE */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Distribuição por Classe</h2>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      {/* <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 inline-block"></span>{" "}
                        Masculino
                      </span>
                      <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 dark:bg-red-400 inline-block"></span>{" "}
                        Feminino
                      </span> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats?.classes.map((cls, idx) => {
                      // Cálculos percentuais por classe para o Slider Único
                      const malePercent = cls.total > 0 ? (cls.m / cls.total) * 100 : 0;
                      const femalePercent = cls.total > 0 ? (cls.f / cls.total) * 100 : 0;

                      return (
                        <div
                          key={idx}
                          className="bg-[#F8FAFC] dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600 flex flex-col justify-between hover:border-slate-200 dark:hover:border-slate-500 transition-all"
                        >
                          <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{cls.total}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-300 mb-2">
                              {cls.name}
                            </div>
                          </div>

                          <div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-400 mb-2 flex items-center gap-3">
                              <span>♂ {cls.m}</span>
                              <span>♀ {cls.f}</span>
                            </div>

                            {/* BARRA / SLIDER ÚNICO DINÂMICO */}
                            <div className="w-full bg-slate-200 dark:bg-slate-600 h-1.5 rounded-full overflow-hidden flex">
                              {cls.total > 0 ? (
                                <>
                                  <div
                                    className="bg-blue-600 h-full transition-all duration-300"
                                    style={{ width: `${malePercent}%` }}
                                  ></div>
                                  <div
                                    className="bg-red-500 h-full transition-all duration-300"
                                    style={{ width: `${femalePercent}%` }}
                                  ></div>
                                </>
                              ) : (
                                <div className="bg-slate-300 dark:bg-slate-500 h-full w-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 2. ABA: MEMBROS */}
        {activeTab === "membros" && <MembrosTab />}

        {/* 3. ABA: LIVROS */}
        {activeTab === "livros" && <LivrosTab />}

        {/* 4. ABA: NOTÍCIAS */}
        {activeTab === "noticias" && <NoticiasTab />}
      </main>
    </div>
  );
}