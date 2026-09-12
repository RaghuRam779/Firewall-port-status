import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Firewall Port Status Checker",
  description: "Analyze firewall exposure and network services using Nmap in real time."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-primary font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
