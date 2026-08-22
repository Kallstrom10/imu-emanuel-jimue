"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname === "/noticias" ||
    pathname === "/biblioteca" ||
    pathname === "/recuperar-senha" ||
    pathname.startsWith("/admin");

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // MUDANÇA NOS TEMAS: CLARO / ESCURO
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 50;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
  };

  if (isAuthPage) return null;

  // 1. Extração robusta do Primeiro e Último Nome
  const firstName =
    user?.firstName || "";

  const lastName =
    user?.lastName || "";

  const fullNameFallback =
    user?.name || user?.nome || user?.fullName || user?.fullname || "";

  const emailPrefix = user?.lastName;

  let rawName = "";
  if (firstName || lastName) {
    rawName = `${firstName} ${lastName}`.trim();
  } else if (fullNameFallback) {
    rawName = fullNameFallback;
  }

  const getFirstAndLastName = (fullName: string) => {
    if (!fullName) return "Utilizador";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  const displayName = getFirstAndLastName(rawName);
  const firstLetter = displayName !== "Utilizador" ? displayName.charAt(0).toUpperCase() : "U";

  // 2. Extração do Telefone e Validação Admin
  const rawPhone =
    user?.phone || user?.telefone || user?.phone_number || "";

  const cleanPhone = String(rawPhone).replace(/\D/g, "");
  const rawRole = String(user?.role || user?.cargo || "").toLowerCase();
  
  // Confirms admin por telefone OU por role/cargo
  const isAdmin = cleanPhone.includes("928246352") || rawRole === "admin" || rawRole === "administrador";

  // 3. Extração do Cargo e Foto de Perfil da Base de Dados
  const displayRole =
    user?.role || user?.cargo || user?.position || (isAdmin ? "Administrador" : "Membro");

  const userAvatar =
    user?.avatarUrl || user?.avatar || user?.photoUrl || user?.foto || null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-red-500/80 backdrop-blur-md shadow-md py-3"
            : "bg-red-500 py-5"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between relative">
          {/* BOTÃO MENU MOBILE */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-white hover:text-red-200 transition-colors p-1 cursor-pointer z-10"
            aria-label="Abrir Menu"
          >
            <Menu size={28} />
          </button>

          {/* LOGO */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 z-10"
          >
            <div className="w-12 h-12 md:w-15 md:h-15 rounded-full bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/20 transition-transform group-hover:scale-105">
              <img
                src="/JIMUE-logo.jpg"
                alt="Logo JIMUE"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <span className="text-xl font-extrabold tracking-wider text-white">
              JIMUE
            </span>
          </Link>

          {/* LINKS - DESKTOP */}
          <nav className="hidden md:flex items-center gap-8 text-white font-medium text-sm uppercase tracking-wider">
            <Link
              href="/#jimue"
              onClick={(e) => handleNavClick(e, "jimue")}
              className="hover:text-red-200 transition-colors"
            >
              JIMUE
            </Link>
            <Link
              href="/#noticias"
              onClick={(e) => handleNavClick(e, "noticias")}
              className="hover:text-red-200 transition-colors"
            >
              Notícias
            </Link>

            {/* LINK BIBLIOTECA - APENAS LOGADO */}
            {user && (
              <Link
                href="/biblioteca"
                className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-amber-100 underline decoration-amber-300 decoration-2 underline-offset-4 hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen size={16} className="text-amber-300" />
                <span>Biblioteca</span>
              </Link>
            )}

            <Link
              href="/#sobre"
              onClick={(e) => handleNavClick(e, "sobre")}
              className="hover:text-red-200 transition-colors"
            >
              Sobre Nós
            </Link>
            <Link
              href="/#contactos"
              onClick={(e) => handleNavClick(e, "contactos")}
              className="hover:text-red-200 transition-colors"
            >
              Contactos
            </Link>
          </nav>

          {/* PERFIL DO UTILIZADOR / LOGIN */}
          <div className="z-10 relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer group"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-red-600 dark:text-red-500 font-black text-lg flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform">
                      {firstLetter}
                    </div>
                  )}
                </button>

                {/* DROPDOWN DO PERFIL */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-3 px-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize truncate">
                        {displayRole}
                      </p>
                    </div>

                    {/* BOTÃO PARA PAINEL ADMIN (SE FOR ADMIN) */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors mb-1"
                      >
                        Painel Admin
                      </Link>
                    )}

                    {/* BOTÃO DE TEMA (SOL / LUA) */}
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors mb-1 cursor-pointer"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun size={14} className="text-amber-400" />
                          <span>Modo Claro</span>
                        </>
                      ) : (
                        <>
                          <Moon size={14} className="text-slate-600" />
                          <span>Modo Escuro</span>
                        </>
                      )}
                    </button>

                    {/* SAIR / LOGOUT */}
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      Terminar Sessão
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-white border border-white px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium hover:bg-white hover:text-red-500 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* OVERLAY MOBILE */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* MENU MOBILE */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-red-600 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/20 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/20">
                <img
                  src="/JIMUE-logo.jpg"
                  alt="Logo JIMUE"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="text-lg font-extrabold tracking-wider text-white">
                JIMUE
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-red-200 p-1 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-6 text-white font-medium text-sm uppercase tracking-wider">
            <Link
              href="/#jimue"
              onClick={(e) => handleNavClick(e, "jimue")}
              className="hover:text-red-200 transition-colors py-1"
            >
              JIMUE
            </Link>
            <Link
              href="/#noticias"
              onClick={(e) => handleNavClick(e, "noticias")}
              className="hover:text-red-200 transition-colors py-1"
            >
              Notícias
            </Link>

            {user && (
              <Link
                href="/biblioteca"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-extrabold text-amber-200 underline decoration-amber-300 underline-offset-4 py-1 flex items-center gap-2"
              >
                <BookOpen size={18} />
                Biblioteca
              </Link>
            )}

            <Link
              href="/#sobre"
              onClick={(e) => handleNavClick(e, "sobre")}
              className="hover:text-red-200 transition-colors py-1"
            >
              Sobre Nós
            </Link>
            <Link
              href="/#contactos"
              onClick={(e) => handleNavClick(e, "contactos")}
              className="hover:text-red-200 transition-colors py-1"
            >
              Contactos
            </Link>
          </nav>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-2xl transition-colors cursor-pointer my-6"
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? (
                <>
                  <Sun size={18} className="text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon size={18} className="text-slate-600" />
                  <span>Modo Escuro</span>
                </>
              )}
            </span>
            <span className="text-xs text-slate-400 uppercase font-bold">
              {theme === "dark" ? "Ativo" : "Desativado"}
            </span>
          </button>
        </div>

        <div className="pt-6 border-t border-white/20 text-xs text-white/80 text-center font-medium">
          Juventude de Emanuel
        </div>
      </aside>
    </>
  );
}