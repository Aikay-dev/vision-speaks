"use client";
import { motion } from 'framer-motion';
import { Youtube, Facebook, ExternalLink } from 'lucide-react';
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL("https://visionspeaks.com"),
//   title: {
//     default: "Media Gallery | Visionspeaks Multimedia Ltd",
//     template: "%s | Visionspeaks Multimedia Ltd",
//   },
//   description:
//     "Explore the media gallery of Visionspeaks Multimedia Ltd, featuring project showcases, installations, corporate updates, and social media highlights.",
//   keywords: [
//     "Visionspeaks",
//     "Media Gallery",
//     "Videos",
//     "Facebook Updates",
//     "YouTube Showcases",
//     "Project Highlights",
//     "Corporate Updates",
//     "IT solutions Nigeria",
//     "security solutions Africa",
//     "multimedia company Nigeria",
//   ],
//   authors: [{ name: "Visionspeaks Multimedia Ltd" }],
//   creator: "Visionspeaks Multimedia Ltd",
//   publisher: "Visionspeaks Multimedia Ltd",
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//       "max-video-preview": -1,
//     },
//   },
//   openGraph: {
//     type: "website",
//     url: "https://visionspeaks.com/gallery",
//     title: "Media Gallery | Visionspeaks Multimedia Ltd",
//     description:
//       "Browse our latest videos, project highlights, and social media updates on the Visionspeaks Multimedia gallery.",
//     siteName: "Visionspeaks",
//     images: [
//       {
//         url: "/og-image-gallery.jpg", // create a custom OG image for Gallery page
//         width: 1200,
//         height: 630,
//         alt: "Visionspeaks Media Gallery",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Media Gallery | Visionspeaks Multimedia Ltd",
//     description:
//       "Discover videos, social updates, and project highlights in the Visionspeaks Multimedia gallery.",
//     images: ["/og-image-gallery.jpg"],
//   },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

const facebookPosts = [
  "https://www.facebook.com/share/p/BwSBAviEeSZUNFej/",
  "https://www.facebook.com/share/p/LBCsmkAKKL1kyJvS/",
  "https://www.facebook.com/share/p/jRSykvYZ2tdU2xiD/",
  "https://www.facebook.com/share/p/m4hBzJUqUXFibooH/",
  "https://www.facebook.com/share/p/UveWiWzPztcuQqT2/",
  "https://www.facebook.com/share/s4RbqQLQRTJqYZ6X/",
  "https://www.facebook.com/share/p/1nLuXqdDLsMDp9bJ/",
  "https://www.facebook.com/share/G6RYvZ8PVr7QW1KA/",
  "https://www.facebook.com/share/P8eixddnzLyN8yo7/"
];

export default function Gallery() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6">Media <span className="text-primary">Gallery</span></h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Explore our latest projects, installations, and corporate updates.
          </p>
        </div>

        {/* YouTube Section */}
        <section className="mb-24">
          <div className="flex items-center space-x-4 mb-12">
            <Youtube className="text-red-500 w-10 h-10" />
            <h2 className="text-3xl font-bold">Video Showcases</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="aspect-video bg-surface rounded-3xl border border-border flex items-center justify-center group cursor-pointer overflow-hidden relative">
                <img 
                  src={`https://images.pexels.com/photos/${i === 1 ? '251225' : '325229'}/pexels-photo-${i === 1 ? '251225' : '325229'}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`} 
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                  alt="Video Thumbnail"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Youtube className="text-white w-10 h-10" fill="white" />
                  </div>
                  <span className="font-bold text-xl">Watch Project Highlight</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="#" className="inline-flex items-center px-8 py-4 bg-surface border border-border rounded-full font-bold hover:bg-border transition-all">
              Visit Our YouTube Channel <ExternalLink className="ml-2 w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Facebook Section */}
        <section>
          <div className="flex items-center space-x-4 mb-12">
            <Facebook className="text-blue-500 w-10 h-10" />
            <h2 className="text-3xl font-bold">Social Updates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facebookPosts.map((post, idx) => (
              <motion.a 
                key={idx}
                href={post}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Facebook className="text-blue-500 w-5 h-5" />
                    </div>
                    <span className="font-bold">Visionspeaks Update</span>
                  </div>
                  <p className="text-textSecondary text-sm mb-6">View our latest project update and community engagement on Facebook.</p>
                </div>
                <span className="text-blue-500 text-sm font-bold flex items-center">
                  View Post <ExternalLink className="ml-2 w-4 h-4" />
                </span>
              </motion.a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
