import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOLEINDEX — Sneaker price index across India's trusted stores",
  description:
    "Compare live sneaker prices across Nike, AJIO, Flipkart, Amazon, VegNonVeg, Crepdog Crew, Extra Butter and more. One search. Every price. Lowest wins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${hanken.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col bg-paper text-ink">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
