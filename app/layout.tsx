import type { Viewport } from "next";
import {
  Almendra,
  Crimson_Text,
  Geist_Mono,
  MedievalSharp,
} from "next/font/google";
import "./globals.css";

const medievalSharp = MedievalSharp({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const crimsonText = Crimson_Text({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const almendra = Almendra({
  variable: "--font-subheading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nocturnus | The V20 Dark Ages Codex",
  description:
    "A digital compendium for the Twentieth Anniversary Edition of Vampire: The Dark Ages.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body
        className={`${crimsonText.className} ${medievalSharp.variable} ${crimsonText.variable} ${almendra.variable} min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
