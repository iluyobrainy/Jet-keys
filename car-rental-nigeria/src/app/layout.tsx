import type { Metadata } from "next";
import { poppins } from "@/lib/fonts";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jet & Keys - Car Rental Services Nigeria",
  description: "Premium car rental services across Nigeria. Book your car today and pay on the spot.",
  keywords: ["car rental", "Nigeria", "premium cars", "luxury vehicles"],
  authors: [{ name: "Jet & Keys" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Jet & Keys - Car Rental Services Nigeria",
    description: "Premium car rental services across Nigeria. Book your car today and pay on the spot.",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dtaspdqcyapnfgcsbtte.supabase.co" />
      </head>
      <body className={`${poppins.variable} font-poppins antialiased`} suppressHydrationWarning>
        <QueryProvider>
          {children}
          <PerformanceMonitor />
        </QueryProvider>
      </body>
    </html>
  );
}
