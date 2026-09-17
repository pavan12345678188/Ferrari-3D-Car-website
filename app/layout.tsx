import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alvantix AutoHub — LaFerrari",
  description: "A cinematic interactive automotive experience by Alvantix.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
