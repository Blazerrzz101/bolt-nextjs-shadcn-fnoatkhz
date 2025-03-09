import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tier'd - Community Ranked Products",
  description: "A platform for community-driven product rankings and reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 