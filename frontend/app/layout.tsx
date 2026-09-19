import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import StorageGate from "@/components/StorageGate";

export const metadata: Metadata = {
  title: "Ruma Studio | Perancang Ruang",
  description:
    "Lukis pelan, susun perabot dan kongsi idea ruang anda. Perancang ruang sumber terbuka.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B2B6B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body className="min-h-screen bg-background font-body antialiased overflow-x-hidden">
        <StorageGate>{children}</StorageGate>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
