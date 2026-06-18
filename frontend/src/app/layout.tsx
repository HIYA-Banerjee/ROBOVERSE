import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoboVerse AI - Virtual Robotics Learning & Simulation Lab",
  description: "Learn robotics engineering, build custom chassis configurations, validate circuit wiring diagrams in real time, and train autonomous reinforcement learning navigation models.",
  openGraph: {
    title: "RoboVerse AI - Virtual Robotics Learning & Simulation Lab",
    description: "Learn robotics engineering, build custom chassis configurations, validate circuit wiring diagrams in real time, and train autonomous reinforcement learning navigation models.",
    url: "https://roboverse.ai",
    siteName: "RoboVerse AI",
    images: [
      {
        url: "/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "RoboVerse AI Robotics Interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
