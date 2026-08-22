import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Header from "@/app/components/Header";
import { ThemeProvider } from "./context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JIMUE - Juventude da Igreja Metodista Unida de Emanuel",
  description: "Site oficial da JIMUE",
  icons: {
    icon: "/JIMUE-logo.jpg", // Caminho para a imagem na pasta public
    shortcut: "/JIMUE-logo.jpg",
    apple: "/JIMUE-logo.jpg", // Opcional: ícone para dispositivos iOS
  },
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
          <ThemeProvider>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}