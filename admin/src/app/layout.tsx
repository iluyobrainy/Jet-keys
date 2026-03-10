import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AdminAuthGate } from "@/components/admin-auth-gate";
import { AdminAuthProvider } from "@/lib/admin-auth-client";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Jet & Keys Admin Panel",
  description: "Admin dashboard for Jet & Keys car rental and private jet services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AdminAuthProvider>
          <AdminAuthGate>{children}</AdminAuthGate>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
