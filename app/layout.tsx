import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Japonism Festival Demo",
  description: "Interactive festival experience with realtime multiplayer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">🎎 Japonism Festival</h1>
            <div className="nav-links">
              <a href="/" className="nav-link">🏠 Home</a>
              <a href="/venue" className="nav-link">🗺️ Venue</a>
              <a href="/controller" className="nav-link">🎮 Controller</a>
              <a href="/dashboard" className="nav-link">📊 Dashboard</a>
            </div>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
