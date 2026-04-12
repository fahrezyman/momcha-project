import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Momcha Admin",
  description: "Admin Dashboard Momcha Babycare",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
