import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://visionspeaks.com"),

  title: {
    default: "Visionspeaks Multimedia Ltd | Security, IT & Multimedia Solutions",
    template: "%s | Visionspeaks Multimedia Ltd",
  },

  description:
    "Visionspeaks Multimedia Ltd provides cutting-edge IT, security, and multimedia solutions across Africa and beyond. Innovation, technology, and safety—now the vision is speaking.",

  keywords: [
    "Visionspeaks",
    "IT solutions Nigeria",
    "security solutions Africa",
    "multimedia company Nigeria",
    "cybersecurity services",
    "IT consulting",
    "surveillance systems",
    "technology solutions Africa",
  ],

  authors: [{ name: "Visionspeaks Multimedia Ltd" }],
  creator: "Visionspeaks Multimedia Ltd",
  publisher: "Visionspeaks Multimedia Ltd",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "https://visionspeaks.com",
    title: "Visionspeaks Multimedia Ltd | Security, IT & Multimedia Solutions",
    description:
      "Cutting-edge Multimedia, IT & Security Solutions for Africa and Beyond. Innovation in Motion.",
    siteName: "Visionspeaks",
    images: [
      {
        url: "/og-image.jpg", // create this later
        width: 1200,
        height: 630,
        alt: "Visionspeaks Multimedia Ltd",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Visionspeaks Multimedia Ltd",
    description:
      "Security, IT & Multimedia solutions powering Africa and beyond.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
