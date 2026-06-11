import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const roobert = localFont({
  src: [
    {
      path: "./fonts/roobert-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/roobert-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/roobert-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/roobert-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-roobert",
});

export const metadata: Metadata = {
  title: "Skinstric",
  description: "Your AI Skin Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roobert.variable}>
      <body>{children}</body>
    </html>
  );
}
