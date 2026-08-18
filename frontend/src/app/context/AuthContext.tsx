"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
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

// Função para padronizar qualquer formato vindo da API ou de objetos aninhados
const normalizeUserData = (rawInput: any): User | null => {
  if (!rawInput) return null;

  // Desembrulha os dados caso venham aninhados (ex: rawInput.user ou rawInput.data)
  const raw = rawInput.user || rawInput.data || rawInput;

  // 1. Extração flexível do Primeiro Nome (camelCase, lowercase, snake_case)
  const fn =
    raw.firstName ||
    raw.firstname ||
    raw.first_name ||
    raw.primeiroNome ||
    raw.primeiro_nome ||
    "";

  // 2. Extração flexível do Último Nome
  const ln =
    raw.lastName ||
    raw.lastname ||
    raw.last_name ||
    raw.ultimoNome ||
    raw.ultimo_nome ||
    "";

  // 3. Extração flexível de Nome Completo como Plano B
  const fullName =
    raw.nome ||
    raw.name ||
    raw.fullName ||
    raw.fullname ||
    raw.full_name ||
    raw.nomeCompleto ||
    "";

  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  const finalFirstName =
    fn || (nameParts.length > 0 ? nameParts[0] : "");

  const finalLastName =
    ln || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");

  // 4. Telefone, Cargo e Avatar
  const phone =
    raw.phone ||
    raw.telefone ||
    raw.numTelefone ||
    raw.phone_number ||
    "";

  const role =
    raw.role ||
    raw.cargo ||
    raw.funcao ||
    raw.position ||
    "";

  const avatarUrl =
    raw.avatarUrl ||
    raw.avatar ||
    raw.foto ||
    raw.imageUrl ||
    raw.photoUrl ||
    "";

  return {
    ...raw,
    id: raw.id || raw._id || "",
    firstName: finalFirstName,
    lastName: finalLastName,
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
    console.log("DADOS RECEBIDOS DO BACKEND:", userData);
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