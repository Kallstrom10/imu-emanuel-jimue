"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // Ajuste o caminho se necessário

export default function Cadastro() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Estado para guardar os dados do formulário
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

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

  // Função para atualizar o estado quando o utilizador digita
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const apenasNumeros = value.replace(/\D/g, "");
      if (apenasNumeros.length <= 9) {
        setFormData({ ...formData, [name]: apenasNumeros });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Função que envia os dados para o backend NestJS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone.length !== 9) {
      toast.error("O número de telefone deve ter exatamente 9 dígitos.", {
        position: "top-right",
      });
      return;
    }

    setIsLoading(true);

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: `${formData.phone}`,
      password: formData.password,
    };

    if (formData.email.trim() !== "") {
      payload.email = formData.email;
    }

    try {
      const response = await fetch(`${API_URL}/members/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cadastrar membro.");
      }

      toast.success("Membro cadastrado com sucesso!", {
        position: "top-right",
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/admin");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar com o servidor.", {
        position: "top-right",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enquanto valida a autenticação, evita renderizar o formulário
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white relative">
      <Toaster />

      {/* MODAL DE ACESSO NEGADO */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 transform transition-all">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Acesso Negado
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Não tem permissão para aceder a esta página. Apenas o
              administrador pode registar novos membros.
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

      {/* LADO ESQUERDO - Branding & Imagem */}
      <div className="hidden lg:flex w-1/2 bg-black text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-800 rounded-full mix-blend-multiply filter blur-[128px] opacity-50"></div>

        <div className="relative z-10 flex justify-between items-center w-full">
          <div className="text-3xl font-extrabold tracking-widest flex items-center gap-2">
            <span className="text-red-500">JIMUE</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft size={16} /> Voltar para o site
          </Link>
        </div>

        <div className="relative z-10 my-auto flex items-center justify-center py-6">
          <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md p-6 shadow-2xl flex items-center justify-center group hover:border-red-500/30 transition-all duration-500">
            <img
              src="/JIMUE-logo.jpg"
              alt="Logo JIMUE"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold leading-tight mb-4">
            Junta-te à nossa <br />
            <span className="text-red-500">Juventude.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Adicione novos membros à nossa comunidade virtual da JIMUE.
          </p>
        </div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-slate-50 relative">
        <div className="w-full max-w-md p-8 sm:p-10 bg-white/60 backdrop-blur-2xl border border-gray-400/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem]">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h2>
          <p className="text-gray-500 mb-8">
            Adicione um novo{" "}
            <span className="text-red-500 hover:text-red-600 font-semibold">
              JOVEM
            </span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Nome"
                  className="w-full pl-10 pr-4 py-4 bg-white/60 border border-gray-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Sobrenome"
                  className="w-full pl-10 pr-4 py-4 bg-white/60 border border-gray-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>

            {/* Email (Opcional) */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email (Opcional)"
                className="w-full pl-10 pr-4 py-4 bg-white/60 border border-gray-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Telefone (+244) */}
            <div className="relative flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <span className="flex items-center pl-10 pr-2 py-4 bg-white/60 border border-gray-200/80 border-r-0 rounded-l-2xl text-gray-600 font-medium select-none shadow-sm">
                +244
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="900 000 000"
                className="w-full px-4 py-4 bg-white/60 border border-gray-200/80 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Palavra-passe */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Palavra-passe"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={isLoading || showAccessModal}
              className="w-full bg-red-600 cursor-pointer hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-red-500/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  A criar conta...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}