"use client";
import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import preciouspic from "@/assets/WhatsApp Image 2026-02-02 at 15.41.45.jpeg";
import enobongPic from "@/assets/WhatsApp Image 2026-02-04 at 18.49.15 (1).jpeg";
import ericpic from "@/assets/WhatsApp Image 2026-02-04 at 18.49.15.jpeg";
import chidipic from "@/assets/WhatsApp Image 2026-02-04 at 18.49.16.jpeg";
import emmanuelpic from "@/assets/emmanuel.png";
import type { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL("https://visionspeaks.com"),
//   title: {
//     default: "Our Team | Visionspeaks Multimedia Ltd",
//     template: "%s | Visionspeaks Multimedia Ltd",
//   },
//   description:
//     "Meet the team of experts at Visionspeaks Multimedia Ltd, driving innovation and excellence in security, media production, IT, and smart automation services.",
//   keywords: [
//     "Visionspeaks",
//     "Team",
//     "Experts",
//     "Multimedia professionals Nigeria",
//     "Security specialists",
//     "IT engineers Nigeria",
//     "Smart home experts",
//     "Media production team",
//     "Corporate technology solutions",
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
//     url: "https://visionspeaks.com/team",
//     title: "Our Team | Visionspeaks Multimedia Ltd",
//     description:
//       "Discover the professionals behind Visionspeaks Multimedia Ltd, providing top-tier security, IT, media, and smart solutions across Africa.",
//     siteName: "Visionspeaks",
//     images: [
//       {
//         url: "/og-image-team.jpg", // create a custom OG image for the Team page
//         width: 1200,
//         height: 630,
//         alt: "Visionspeaks Team Experts",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Our Team | Visionspeaks Multimedia Ltd",
//     description:
//       "Meet the dedicated team driving innovation and excellence at Visionspeaks Multimedia Ltd in security, media, IT, and smart automation.",
//     images: ["/og-image-team.jpg"],
//   },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

const team = [
  {
    name: "Precious Akhiankore",
    role: "Founder / CEO / MD",
    image: preciouspic,
  },
  {
    name: "Enobong A. Precious",
    role: "GM / Head: Customer Relations",
    image: enobongPic,
  },
  {
    name: "Emmanuel Esekhaigbe",
    role: "Head: Web Development / Software Engineering",
    image: emmanuelpic,
    in: "https://www.linkedin.com/in/emmanuel-esekhaigbe-3b9046241/",
    mail: "mailto:emmanese2020@gmail.com",
  },
  {
    name: "Eric Akhiankore",
    role: "Digital Media Productions Manager",
    desc: "BSc. Business Management",
    image: ericpic,
  },
  {
    name: "Chidiebere Okoji",
    role: "Technical Director / Command Centre Administrator",
    desc: "BEngr Electrical & Electronic Engineering",
    image: chidipic,
  },
];

export default function Team() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6">
            The <span className="text-primary">Experts</span>
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Our team of dedicated professionals has driven 300% growth in our
            first decade through innovation and technical excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl overflow-hidden group"
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                  width={300}
                  height={500}
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary font-semibold mb-4">{member.role}</p>
                {member.desc && (
                  <p className="text-textSecondary text-sm mb-6">
                    {member.desc}
                  </p>
                )}
                <div className="flex space-x-4">
                  <a
                    href={member.in ?? "#"}
                    className="text-textSecondary hover:text-primary transition-colors"
                  >
                    <Linkedin size={20} />
                  </a>
                  <a
                    href={member.mail ?? "#"}
                    className="text-textSecondary hover:text-primary transition-colors"
                  >
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
