"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, Loader2, ArrowLeft, AlertCircle, CheckCircle, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [phoneInput, setPhoneInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Notificação flutuante de sucesso / erro
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal de Esqueceu Senha e Solicitar Conta
  const [activeModal, setActiveModal] = useState<"forgot" | "request" | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Requisição de login para a API NestJS
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guarda as informações de login no contexto
        login(data.user, data.token);

        // Verificação: exclusivamente com base no número de telefone (928246352)
        const userPhone = (phoneInput || data.user?.phone || data.user?.telefone || "").replace(/\s+/g, "");
        const isAdmin = userPhone.endsWith("928246352");

        if (isAdmin) {
          showToast("success", "Bem-vindo, Administrador! A redirecionar...");
          setTimeout(() => router.push("/admin"), 1200);
        } else {
          showToast("success", "Login efetuado com sucesso! A redirecionar...");
          setTimeout(() => router.push("/"), 1200);
        }
      } else {
        setIsLoading(false);
        const errorMessage = Array.isArray(data.message)
          ? data.message[0]
          : data.message || "Telefone ou palavra-passe incorretos. Tente novamente!";
        showToast("error", errorMessage);
      }
    } catch (error) {
      setIsLoading(false);
      showToast("error", "Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* NOTIFICAÇÃO TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={22} />
          ) : (
            <AlertCircle size={22} />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Efeitos de fundo subtis */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-red-100/50 dark:bg-red-900/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none transition-colors duration-300" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-gray-200/50 dark:bg-slate-800/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none transition-colors duration-300" />

      {/* Botão de voltar para a Home */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft size={16} /> Voltar ao site
        </Link>
      </div>

      {/* Container do Formulário */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 bg-white/60 dark:bg-slate-800/80 backdrop-blur-2xl border border-gray-400/80 dark:border-slate-600 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] transition-colors duration-300">
        
        {/* Logo da JIMUE */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-700 rounded-2xl flex items-center justify-center overflow-hidden p-2.5 transition-colors">
            <img
              src="/JIMUE-logo.jpg"
              alt="Logo JIMUE"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Textos de Cabeçalho */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
            Juventude da Emanuel
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium transition-colors">
            Seja muito bem-vindo
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campo de Telefone */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="tel"
              required
              placeholder="Número de telefone"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-slate-900/50 border border-gray-200/80 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm"
            />
          </div>

          {/* Campo de Palavra-passe */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Palavra-passe"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-slate-900/50 border border-gray-200/80 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Link para recuperar senha */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setActiveModal("forgot")}
              className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 dark:bg-white cursor-pointer hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20 dark:shadow-none mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                A entrar...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Link para solicitar conta */}
        <div className="mt-8 text-center border-t border-gray-200/50 dark:border-slate-700/50 pt-6 transition-colors">
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Ainda não tem acesso?{" "}
            <button
              type="button"
              onClick={() => setActiveModal("request")}
              className="text-red-500 hover:text-red-600 font-bold transition-colors cursor-pointer"
            >
              Solicitar conta
            </button>
          </p>
        </div>

      </div>

      {/* MODAL DE SUPORTE */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 sm:p-8 relative text-center animate-in zoom-in-95 duration-200 transition-colors">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-500/20 transition-colors">
              <AlertCircle size={32} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 transition-colors">
              {activeModal === "forgot" ? "Recuperação de Senha" : "Solicitar Conta"}
            </h3>

            <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6 transition-colors">
              {activeModal === "forgot" ? (
                <>
                  Para a recuperação da sua senha contacte ao suporte a partir do email:{" "}
                  <strong className="text-red-500 font-bold">rodsonp521@gmail.com</strong>{" "}
                  ou pelo WhatsApp:{" "}
                  <strong className="text-red-500 font-bold">+244928246352</strong>
                </>
              ) : (
                <>
                  Solicite uma conta enviando uma mensagem no e-mail:{" "}
                  <strong className="text-red-500 font-bold">rodsonp521@gmail.com</strong>{" "}
                  ou no WhatsApp:{" "}
                  <strong className="text-red-500 font-bold">+244928246352</strong>
                </>
              )}
            </p>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}