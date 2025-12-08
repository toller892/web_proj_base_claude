import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "三角洲行动 - 游戏商店",
  description: "三角洲行动游戏商店 - 精选热门道具，限时特惠",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-900 text-gray-100 min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
