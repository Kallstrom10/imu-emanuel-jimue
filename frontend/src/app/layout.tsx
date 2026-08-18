import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Header from "@/app/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JIMUE - Juventude da Igreja Metodista Unida de Emanuel",
  description: "Site oficial da JIMUE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-AO">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {/* O pt-24 adiciona um espaçamento no topo para o conteúdo não ficar escondido atrás do cabeçalho fixo */}
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}