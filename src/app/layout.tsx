import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLB GYM Mạnh Cường — Phòng Gym Chuyên Nghiệp",
  description: "CLB GYM Mạnh Cường – Rèn luyện thân thể, nâng cao sức khoẻ với đội ngũ huấn luyện viên chuyên nghiệp.",
  keywords: "gym, yoga, fitness, training, workout, health",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <body className="min-h-full noise">{children}</body>
    </html>
  );
}
