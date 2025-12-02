import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/Header/Header";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mixtape :: Your Personal Radio Station",
  description: "Personalized radio station powered by Mixtape",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${readexPro.variable} antialiased`}>
          <Header />
          {children}
          <footer></footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
