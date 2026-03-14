import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AAU Assistant – Addis Ababa University RAG",
  description:
    "AI-powered assistant for Addis Ababa University – ask questions about student handbooks, policies, courses and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
