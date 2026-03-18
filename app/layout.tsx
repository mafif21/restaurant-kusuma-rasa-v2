import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata: Metadata = {
  title: "Kusuma Rasa CMS",
  description: "Restaurant CMS frontend for menu, categories, and transactions."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>{children}</body>
    </html>
  );
}
