'use client';
import { motion } from 'framer-motion';
import { 
  Shield, Video, Cpu, Fingerprint, Home, 
  Camera, Bell, Smartphone, Monitor, 
  Film, Mic, Layers, Settings, Zap, 
  Lock, Sun, Wifi 
} from 'lucide-react';
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL("https://visionspeaks.com"),
//   title: {
//     default: "Services & Solutions | Visionspeaks Multimedia Ltd",
//     template: "%s | Visionspeaks Multimedia Ltd",
//   },
//   description:
//     "Discover the full range of services offered by Visionspeaks Multimedia Ltd, including advanced security systems, media production, IT solutions, and smart home & office automation tailored for businesses and individuals.",
//   keywords: [
//     "Visionspeaks",
//     "Security services Nigeria",
//     "Media production Nigeria",
//     "IT solutions Africa",
//     "Smart home automation",
//     "CCTV monitoring services",
//     "Corporate IT services",
//     "Biometric systems Nigeria",
//     "Film production services",
//     "Multimedia solutions",
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
//     url: "https://visionspeaks.com/services",
//     title: "Services & Solutions | Visionspeaks Multimedia Ltd",
//     description:
//       "Explore Visionspeaks Multimedia Ltd's technological solutions in security, media, IT, and smart home & office automation.",
//     siteName: "Visionspeaks",
//     images: [
//       {
//         url: "/og-image-services.jpg", // create a custom OG image for Services page
//         width: 1200,
//         height: 630,
//         alt: "Visionspeaks Services & Solutions",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Services & Solutions | Visionspeaks Multimedia Ltd",
//     description:
//       "Offering security, media production, IT, and smart automation solutions across Africa with excellence and innovation.",
//     images: ["/og-image-services.jpg"],
//   },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

const serviceCategories = [
  {
    title: "Core Security & Monitoring",
    icon: Shield,
    color: "text-primary",
    services: [
      "24/7 CCTV Monitoring Services",
      "Election Monitoring",
      "Remote Surveillance & Incident Alerts",
      "Home and Business Security Monitoring",
      "Smart Surveillance Integration",
      "Device Installation & Technical Support",
      "Digital Access to Live Feeds",
      "Security Assessment & Advisory",
      "Digital Instant Security Alert System (D.I.S.A.L)"
    ]
  },
  {
    title: "Media & Digital Production",
    icon: Video,
    color: "text-secondary",
    services: [
      "Film Production",
      "Corporate & Biography Documentaries",
      "Political / Corporate Jingles",
      "Live Event Video Coverage",
      "Mobile Studio Services",
      "Digital Studio Design & Installation",
      "Sound Design & Installation",
      "Stage Set Design & Props"
    ]
  },
  {
    title: "IT & Biometric Technology",
    icon: Fingerprint,
    color: "text-accent",
    services: [
      "Computer Engineering & Networking",
      "Programming & Software Engineering",
      "Biometric Hospital Management Systems",
      "Biometric Time & Attendance Systems",
      "Biometric Security for Estates & Schools",
      "Structured Networking & ELV Cabling"
    ]
  },
  {
    title: "Smart Home & Office",
    icon: Home,
    color: "text-success",
    services: [
      "Smart Home Automation",
      "Smart Door Locks & Access Control",
      "Smart Lighting & Voice Integration",
      "Automated Curtains & Blinds",
      "Multi-room Audio Systems",
      "IP Intercom Systems",
      "Motorized Gates",
      "Solar Inverter Solutions"
    ]
  }
];

export default function Services() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6">Our <span className="text-primary">Solutions</span></h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Comprehensive technological services tailored for security, media, and infrastructure excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceCategories.map((category, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-10 rounded-3xl"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className={`p-4 rounded-2xl bg-surface border border-border`}>
                  <category.icon className={`w-8 h-8 ${category.color}`} />
                </div>
                <h2 className="text-2xl font-bold">{category.title}</h2>
              </div>
              <ul className="grid grid-cols-1 gap-4">
                {category.services.map((service, sIdx) => (
                  <li key={sIdx} className="flex items-start space-x-3 text-textSecondary">
                    <Zap className={`w-5 h-5 mt-1 shrink-0 ${category.color}`} />
                    <span className="text-lg">{service}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-primary rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to secure your future?</h2>
          <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
            Contact our technical team today for a comprehensive assessment of your security or IT needs.
          </p>
          <a href="/contact" className="inline-block px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-all">
            Request a Consultation
          </a>
        </div>
      </div>
    </div>
  );
}
