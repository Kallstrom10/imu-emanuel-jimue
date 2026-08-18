"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  [key: string]: any; // Permite campos extras vindos do backend
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: any, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para padronizar qualquer formato vindo da API
const normalizeUserData = (raw: any): User | null => {
  if (!raw) return null;

  // 1. Tratamento de Nome (firstname / lastname / nome completo)
  const fn = raw.firstname || raw.firstName || raw.primeiroNome || "";
  const ln = raw.lastname || raw.lastName || raw.ultimoNome || "";
  
  const fullName = raw.nome || raw.name || raw.fullName || "";
  const nameParts = fullName.trim().split(/\s+/);

  const finalFirstName = fn || nameParts[0] || "";
  const finalLastName =
    ln || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");

  // 2. Telefone, Cargo e Avatar
  const phone = raw.phone || raw.telefone || raw.numTelefone || "";
  const role = raw.role || raw.cargo || raw.funcao || "";
  const avatarUrl =
    raw.avatarUrl || raw.avatar || raw.foto || raw.imageUrl || "";

  return {
    ...raw,
    id: raw.id || raw._id || "",
    firstname: finalFirstName,
    lastname: finalLastName,
    phone: String(phone),
    role: role,
    avatarUrl: avatarUrl,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("jimue_user");
    const storedToken = localStorage.getItem("jimue_token");

    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(normalizeUserData(parsed));
        setToken(storedToken);
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação", error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: any, newToken: string) => {
    console.log("DADOS RECEBIDOS DO BACKEND:", userData); // Para inspeção no F12
    const normalizedUser = normalizeUserData(userData);

    if (normalizedUser) {
      setUser(normalizedUser);
      setToken(newToken);
      localStorage.setItem("jimue_user", JSON.stringify(normalizedUser));
      localStorage.setItem("jimue_token", newToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("jimue_user");
    localStorage.removeItem("jimue_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}