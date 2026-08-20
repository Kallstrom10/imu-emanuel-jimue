"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; 
import {
  Lock,
  Phone,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

interface Notification {
  type: "success" | "error";
  message: string;
}

export default function RecuperarSenhaPage() {
  const router = useRouter();

  // Estados do formulário
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de verificação de permissão e modais
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !newPassword.trim()) {
      showToast("error", "Por favor, preencha todos os campos.");
      return;
    }

    if (newPassword.length < 6) {
      showToast("error", "A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/users/admin/reset-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: phone.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", data.message || "Palavra-passe alterada com sucesso!");
        setTimeout(() => router.push("/admin"), 1200)
      } else {
        showToast("error", data.message || "Erro ao redefinir a palavra-passe.");
      }
    } catch (error) {
      console.error("Erro ao alterar palavra-passe:", error);
      showToast("error", "Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAccessModal = () => {
    setShowAccessModal(false);
    router.push("/");
  };

  // Enquanto valida a autenticação, evita renderizar o formulário (IGUAL AO CADASTRO)
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* NOTIFICAÇÃO DE FEEDBACK */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
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
        </div>
      )}

      {/* MODAL DE BLOQUEIO DE ACESSO */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">
              Acesso Negado
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Não tem permissão para aceder a esta página. Apenas os administradores podem redefinir palavras-passe.
            </p>
            <button
              onClick={handleCloseAccessModal}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer"
            >
              Voltar à página inicial
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA PÁGINA */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in duration-300">
        {/* TOPO DA PÁGINA */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl">
              <KeyRound size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Recuperar Palavra-passe</h1>
              <p className="text-xs text-slate-400">
                Painel de Gestão do Administrador
              </p>
            </div>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleResetPassword} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Número de Telefone do Membro
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                required
                placeholder="Ex: 923456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Digite a Nova Palavra-passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting || showAccessModal}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>A atualizar...</span>
              </>
            ) : (
              <span>Atualizar Palavra-passe</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}