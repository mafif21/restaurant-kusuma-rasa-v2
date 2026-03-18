import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kusuma Rasa CMS",
  description: "Restaurant CMS frontend for menu, categories, and transactions."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
