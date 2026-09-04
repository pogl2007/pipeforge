import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PIPEFORGE — визуальный конструктор ML-пайплайнов",
  description:
    "Строй ML пайплайны как блок-схемы. Перетащи блоки, соедини стрелками, запусти обучение с автоподбором гиперпараметров.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-bg text-text-primary text-base`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
