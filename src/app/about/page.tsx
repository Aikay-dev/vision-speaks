"use client";
import { motion } from "framer-motion";
import { Target, Eye, History, Award } from "lucide-react";
import type { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL("https://visionspeaks.com"),
//   title: {
//     default:
//       "About Visionspeaks Multimedia Ltd | Security, IT & Multimedia Solutions",
//     template: "%s | Visionspeaks Multimedia Ltd",
//   },
//   description:
//     "Learn about Visionspeaks Multimedia Ltd, a leading company providing innovative IT, security, and multimedia solutions across Africa.",
//   keywords: [
//     "Visionspeaks",
//     "About Visionspeaks",
//     "IT solutions Nigeria",
//     "security solutions Africa",
//     "multimedia company Nigeria",
//     "company history",
//     "vision and mission",
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
//     url: "https://visionspeaks.com/about",
//     title:
//       "About Visionspeaks Multimedia Ltd | Security, IT & Multimedia Solutions",
//     description:
//       "Discover the history, vision, and mission of Visionspeaks Multimedia Ltd.",
//     siteName: "Visionspeaks",
//     images: [
//       {
//         url: "/og-image-about.jpg",
//         width: 1200,
//         height: 630,
//         alt: "About Visionspeaks Multimedia Ltd",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "About Visionspeaks Multimedia Ltd",
//     description:
//       "Learn about our vision, mission, and growth as a leading multimedia & IT company.",
//     images: ["/og-image-about.jpg"],
//   },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };
export default function About() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl font-black mb-6">
            About <span className="text-primary">Visionspeaks</span>
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            A Limited Liability Company offering cutting-edge technological
            solutions in the media, information technology, and security
            industries.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <History className="text-primary w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Our History</h3>
                <p className="text-textSecondary leading-relaxed">
                  Founded in 2011, Visionspeaks started with computer sales,
                  engineering, and networking. Over the years, we have
                  strategically expanded into multimedia, telecoms, security,
                  and advanced surveillance, becoming a leader in the Nigerian
                  tech landscape.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="p-4 bg-secondary/10 rounded-2xl">
                <Award className="text-secondary w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Our Growth</h3>
                <p className="text-textSecondary leading-relaxed">
                  In our first decade, we achieved a remarkable 300% growth,
                  driven by our dedication to quality and our ability to adapt
                  to the rapidly evolving technological needs of our clients.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border">
            <img
              src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Team Meeting"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-card p-12 rounded-3xl border-primary/20"
          >
            <Target className="text-primary w-12 h-12 mb-6" />
            <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
            <p className="text-textSecondary text-lg leading-relaxed">
              "To be the foremost, preferred, customer-centric Multimedia,
              Computer and Information Technology & Security systems Company in
              Africa."
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-card p-12 rounded-3xl border-secondary/20"
          >
            <Eye className="text-secondary w-12 h-12 mb-6" />
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-textSecondary text-lg leading-relaxed">
              "To provide world-class proactive remote CCTV surveillance
              services in Nigeria using advanced surveillance technologies,
              professional monitoring standards, and innovative security
              solutions that protect lives, assets, and businesses."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
