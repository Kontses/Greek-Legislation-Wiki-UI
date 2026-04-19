import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "greek"],
});

export const metadata: Metadata = {
  title: "Greek Legislation Wiki",
  description: "Legal Information System",
};

import TopNav from "@/components/TopNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Script to run immediately to apply theme from localStorage to avoid FOUC
  const themeInitScript = `
    (function() {
      try {
        var saved = localStorage.getItem('theme');
        var theme = saved || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `;

  return (
    <html lang="el" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <TopNav />
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
