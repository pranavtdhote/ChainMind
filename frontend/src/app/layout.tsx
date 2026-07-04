import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChainMind Protocol | The Trust & Memory Layer for the Agent Economy",
  description:
    "An operating system for collaborative AI Agents. Build, verify, and persist agent swarm workflows with decentralized memory on IPFS and high-speed consensus on Monad Testnet.",
  keywords: [
    "AI Agents",
    "Web3 AI",
    "Monad Testnet",
    "Agent Court",
    "Agent swarm",
    "Decentralized Memory",
    "IPFS",
    "Agent Economy",
  ],
  authors: [{ name: "ChainMind Team" }],
  openGraph: {
    title: "ChainMind Protocol - Trust & Memory Layer",
    description: "Multi-agent collaboration powered by Monad and IPFS.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#09090b] text-zinc-100 min-h-screen flex flex-col`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
