import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Rehabilitación Neurocognitiva - Oscar",
  description: "Suite de juegos interactivos optimizados para la rehabilitación neurocognitiva y motora de Oscar.",
  appleWebApp: {
    capable: true,
    title: "Rehab Oscar",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${outfit.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col">{children}</body>
    </html>
  );
}
