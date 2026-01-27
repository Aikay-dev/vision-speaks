import { motion } from 'framer-motion';
import { FileText, Download, Shield, CheckCircle2 } from 'lucide-react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://visionspeaks.com"),
  title: {
    default: "Downloads & Resources | Visionspeaks Multimedia Ltd",
    template: "%s | Visionspeaks Multimedia Ltd",
  },
  description:
    "Access and download official Visionspeaks Multimedia Ltd documents, company profiles, service catalogs, and technical specifications.",
  keywords: [
    "Visionspeaks",
    "Downloads",
    "Resources",
    "Company Profile",
    "Service Catalog",
    "Technical Specs",
    "Project Portfolio",
    "IT solutions Nigeria",
    "security solutions Africa",
    "multimedia company Nigeria",
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
    url: "https://visionspeaks.com/downloads",
    title: "Downloads & Resources | Visionspeaks Multimedia Ltd",
    description:
      "Download official documents and company profiles from Visionspeaks Multimedia Ltd, including service catalogs, technical specs, and project portfolios.",
    siteName: "Visionspeaks",
    images: [
      {
        url: "/og-image-downloads.jpg", // create a custom OG image for Downloads page
        width: 1200,
        height: 630,
        alt: "Visionspeaks Downloads & Resources",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Downloads & Resources | Visionspeaks Multimedia Ltd",
    description:
      "Download our official documents, service catalogs, and company profiles from Visionspeaks Multimedia Ltd.",
    images: ["/og-image-downloads.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function Downloads() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black mb-6">Resources</h1>
            <p className="text-xl text-textSecondary">
              Download our official documents and company profiles.
            </p>
          </div>

          <div className="glass-card p-12 rounded-3xl border-primary/20 flex flex-col md:flex-row items-center gap-12">
            <div className="w-32 h-32 bg-primary/10 rounded-3xl flex items-center justify-center shrink-0">
              <FileText className="text-primary w-16 h-16" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">Company Profile 2024</h2>
              <p className="text-textSecondary text-lg mb-8">
                Get a detailed overview of our services, team, past projects, and technical capabilities in one comprehensive document.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Service Catalog</span>
                </div>
                <div className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Technical Specs</span>
                </div>
                <div className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Project Portfolio</span>
                </div>
                <div className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Contact Info</span>
                </div>
              </div>
              <a 
                href="/company-profile.pdf" 
                download
                className="inline-flex items-center px-10 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all group"
              >
                Download Company Profile <Download className="ml-2 group-hover:translate-y-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="mt-16 p-8 bg-surface rounded-2xl border border-border flex items-center space-x-4">
            <Shield className="text-secondary w-8 h-8 shrink-0" />
            <p className="text-textSecondary text-sm">
              All documents are provided in PDF format. If you have trouble downloading, please contact our support team at Visionspeaks.multimedia@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
