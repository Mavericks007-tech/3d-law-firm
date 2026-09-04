import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

const cabinet = localFont({
  src: "./fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet",
  display: "swap",
  weight: "100 900",
  fallback: ["Archivo", "system-ui", "sans-serif"],
});

const switzer = localFont({
  src: "./fonts/Switzer-Variable.woff2",
  variable: "--font-switzer",
  display: "swap",
  weight: "100 900",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Wildan Legal Solicitors — Your legal partner in every situation",
  description:
    "A solicitors' practice covering corporate, intellectual property, family, criminal defence and estate matters. Clear advice, agreed costs, a named solicitor on every file.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cabinet.variable} ${switzer.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
