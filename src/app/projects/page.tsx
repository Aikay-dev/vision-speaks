"use client";
import { motion } from "framer-motion";
import { Calendar, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import elec1 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.08 (1).jpeg";
import elec2 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.08 (2).jpeg";
import elec3 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.08.jpeg";
import elec4 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.09 (1).jpeg";
import elec5 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.09 (2).jpeg";
import elec6 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.09 (3).jpeg";
import elec7 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.09 (4).jpeg";
import elec8 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.09 (5).jpeg";
import elec9 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.09.jpeg";
import elec10 from "@/assets/2024-election/WhatsApp Image 2026-02-17 at 16.26.10.jpeg";
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL("https://visionspeaks.com"),
//   title: {
//     default: "Projects & Milestones | Visionspeaks Multimedia Ltd",
//     template: "%s | Visionspeaks Multimedia Ltd",
//   },
//   description:
//     "Explore the major projects and milestones of Visionspeaks Multimedia Ltd, highlighting our work across government, corporate, and religious sectors in multimedia, IT, and security.",
//   keywords: [
//     "Visionspeaks",
//     "Projects",
//     "Milestones",
//     "Portfolio",
//     "Multimedia Projects",
//     "IT Projects",
//     "Security Projects",
//     "CCTV Installations",
//     "Corporate Projects Nigeria",
//     "Government Projects Nigeria",
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
//     url: "https://visionspeaks.com/projects",
//     title: "Projects & Milestones | Visionspeaks Multimedia Ltd",
//     description:
//       "Discover the legacy of excellence from Visionspeaks Multimedia Ltd through our projects and milestones across various sectors.",
//     siteName: "Visionspeaks",
//     images: [
//       {
//         url: "/og-image-projects.jpg", // create a custom OG image for Projects page
//         width: 1200,
//         height: 630,
//         alt: "Visionspeaks Projects & Milestones",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Projects & Milestones | Visionspeaks Multimedia Ltd",
//     description:
//       "Showcasing Visionspeaks Multimedia Ltd's portfolio of projects and achievements in multimedia, IT, and security sectors.",
//     images: ["/og-image-projects.jpg"],
//   },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

export const projects = [
  {
    id: "1",
    year: "2011",
    title: "Living Faith Church Uyo",
    desc: "Digital Multimedia Studio Installation",
    category: "Multimedia",
    media: [
      { type: "image", src: "/images/livingfaith1.jpg", isExternal: false },
      {
        type: "image",
        src: "https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg",
        isExternal: true,
      },
      { type: "video", src: "/videos/livingfaith.mp4", isExternal: false },
    ],
  },
  {
    id: "2",
    year: "2014",
    title: "RCCG Provincial HQ Port Harcourt",
    desc: "Professional Studio Installation",
    category: "Multimedia",
    media: [
      { type: "image", src: "/images/rccg1.jpg", isExternal: false },
      {
        type: "video",
        src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        isExternal: true,
      },
    ],
  },
  {
    id: "3",
    year: "2016",
    title: "Salvation Ministries Port Harcourt",
    desc: "Advanced Studio Installation",
    category: "Multimedia",
    media: [
      { type: "image", src: "/images/salvation1.jpg", isExternal: false },
      { type: "image", src: "/images/salvation2.jpg", isExternal: false },
    ],
  },
  {
    id: "4",
    year: "2018",
    title: "Mountain of Fire & Miracles Ministries Calabar",
    desc: "Studio & Mobile Studio Design",
    category: "Multimedia",
    media: [
      { type: "video", src: "/videos/mfm_calabar.mp4", isExternal: false },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1601758123927-9e1a3c203a4c",
        isExternal: true,
      },
    ],
  },
  {
    id: "5",
    year: "2019",
    title: "Niger State Governorship Election",
    desc: "E-campaign Infrastructure & Mobile Studio",
    category: "IT & Media",
    media: [
      { type: "image", src: "/images/niger_election1.jpg", isExternal: false },
      { type: "video", src: "/videos/niger_election.mp4", isExternal: false },
    ],
  },
  {
    id: "6",
    year: "2022",
    title: "Nigerian Police Force IGP Squad Uyo",
    desc: "Advanced Surveillance Systems Installation",
    category: "Security",
    media: [
      { type: "image", src: "/images/npf_igp1.jpg", isExternal: false },
      {
        type: "video",
        src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        isExternal: true,
      },
    ],
  },
  {
    id: "7",
    year: "2023",
    title: "Nigerpet Construction",
    desc: "Comprehensive CCTV Installation",
    category: "Security",
    media: [
      { type: "image", src: "/images/nigerpet1.jpg", isExternal: false },
      { type: "image", src: "/images/nigerpet2.jpg", isExternal: false },
      { type: "video", src: "/videos/nigerpet.mp4", isExternal: false },
    ],
  },
  {
    id: "8",
    year: "2024",
    title: "AKEES Akwa Ibom State Government",
    desc: "Database Design & Management",
    category: "IT",
    media: [
      { type: "image", src: "/images/akees1.jpg", isExternal: false },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1612831666416-5c2ed0de805b",
        isExternal: true,
      },
    ],
  },
  {
    id: "9",
    year: "2024",
    title:
      "Real-Time Election Video Monitoring and Live Result Collation Command Centre/Situation Room",
    desc: "Election monitoring & surveillance",
    category: "IT",
    media: [
      { type: "image", src: elec1, isExternal: false },
      { type: "image", src: elec2, isExternal: false },
      { type: "image", src: elec3, isExternal: false },
      { type: "image", src: elec4, isExternal: false },
      { type: "image", src: elec5, isExternal: false },
      { type: "image", src: elec6, isExternal: false },
      { type: "image", src: elec7, isExternal: false },
      { type: "image", src: elec8, isExternal: false },
      { type: "image", src: elec9, isExternal: false },
      { type: "image", src: elec10, isExternal: false },
      // {
      //   type: "image",
      //   src: "https://images.unsplash.com/photo-1612831666416-5c2ed0de805b",
      //   isExternal: true,
      // },
    ],
  },
];

export default function Projects() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6">
            Our <span className="text-primary">Milestones</span>
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            A legacy of excellence across government, religious, and corporate
            sectors.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12">
            {[...projects].reverse().map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center ${
                  idx % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 w-full md:w-1/2 px-8">
                  {/* Wrap the card in Link */}
                  <Link
                    aria-label={`Open project ${project.title}`}
                    href={`/projects/${project.id}`}
                    className="block"
                  >
                    <div
                      className={`glass-card p-8 rounded-3xl border-l-4 cursor-pointer hover:shadow-xl transition-all ${
                        idx % 2 === 0
                          ? "border-l-primary"
                          : "border-l-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-primary font-bold flex items-center">
                          <Calendar className="w-4 h-4 mr-2" /> {project.year}
                        </span>
                        <span className="px-3 py-1 bg-surface rounded-full text-xs font-bold text-textSecondary uppercase tracking-wider">
                          {project.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {project.title}
                      </h3>
                      <p className="text-textSecondary">{project.desc}</p>
                    </div>
                  </Link>
                </div>

                <div className="relative flex items-center justify-center w-12 h-12">
                  <div className="w-4 h-4 bg-primary rounded-full z-10 border-4 border-background" />
                </div>

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
