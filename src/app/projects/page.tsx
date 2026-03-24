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
import akees1 from "@/assets/akees/WhatsApp Image 2024-02-28 at 12.30.02_e12ce554.jpg";
import akees2 from "@/assets/akees/WhatsApp Image 2024-02-28 at 12.31.00_3b5d6740.jpg";

import niger1 from "@/assets/niger/P1060006.jpg";
import niger6 from "@/assets/niger/P1060194.jpg";
import niger7 from "@/assets/niger/P1060302.jpg";
import niger8 from "@/assets/niger/P1060369.jpg";
import niger9 from "@/assets/niger/P1060429.jpg";
import niger10 from "@/assets/niger/P1060121.jpg";
import niger11 from "@/assets/niger/P1060127.jpg";
import niger12 from "@/assets/niger/P1060139.jpg";
import niger13 from "@/assets/niger/P1060149.jpg";
import niger14 from "@/assets/niger/P1060173.jpg";
import niger15 from "@/assets/niger/P1060210.jpg";
import niger16 from "@/assets/niger/P1060303.jpg";
import niger17 from "@/assets/niger/P1060371.jpg";
import niger18 from "@/assets/niger/P1060122.jpg";
import niger19 from "@/assets/niger/P1060129.jpg";
import niger20 from "@/assets/niger/P1060141.jpg";
import niger21 from "@/assets/niger/P1060151.jpg";
import niger22 from "@/assets/niger/P1060174.jpg";
import niger23 from "@/assets/niger/P1060299.jpg";
import niger24 from "@/assets/niger/P1060315.jpg";
import niger25 from "@/assets/niger/P1060374.jpg";
import niger26 from "@/assets/niger/P1060124.jpg";
import niger27 from "@/assets/niger/P1060130.jpg";
import niger28 from "@/assets/niger/P1060143.jpg";
import niger29 from "@/assets/niger/P1060168.jpg";
import niger30 from "@/assets/niger/P1060190.jpg";
import niger31 from "@/assets/niger/P1060301.jpg";
import niger32 from "@/assets/niger/P1060321.jpg";
import niger33 from "@/assets/niger/P1060384.jpg";

import eket1 from "@/assets/eket/20170228_120920.jpg";
import eket2 from "@/assets/eket/20170302_155103.jpg";
import eket3 from "@/assets/eket/20170303_140427.jpg";
import eket4 from "@/assets/eket/20170309_181734.jpg";
import eket5 from "@/assets/eket/20170310_182252.jpg";
import eket6 from "@/assets/eket/20170228_125609.jpg";
import eket7 from "@/assets/eket/20170302_181236.jpg";
import eket9 from "@/assets/eket/20170303_140450.jpg";
import eket10 from "@/assets/eket/20170310_160228.jpg";
import eket11 from "@/assets/eket/IMG_20170604_074910.jpg";
import eket12 from "@/assets/eket/20170228_125618.jpg";
import eket13 from "@/assets/eket/20170302_181244.jpg";
import eket14 from "@/assets/eket/20170303_152103.jpg";
import eket15 from "@/assets/eket/20170310_160239.jpg";
import eket16 from "@/assets/eket/IMG_20170604_074918.jpg";
import eket17 from "@/assets/eket/20170301_130706.jpg";
import eket18 from "@/assets/eket/20170302_181300.jpg";
import eket19 from "@/assets/eket/20170303_152113.jpg";
import eket20 from "@/assets/eket/20170310_160302.jpg";
import eket21 from "@/assets/eket/IMG_20170604_074931.jpg";
import eket22 from "@/assets/eket/20170301_130722.jpg";
import eket23 from "@/assets/eket/20170302_181331.jpg";
import eket24 from "@/assets/eket/20170303_173241.jpg";
import eket25 from "@/assets/eket/20170310_160319.jpg";
import eket26 from "@/assets/eket/IMG_20170604_074939.jpg";
import eket27 from "@/assets/eket/20170301_155914.jpg";
import eket28 from "@/assets/eket/20170302_181339.jpg";
import eket29 from "@/assets/eket/20170303_193900.jpg";
import eket30 from "@/assets/eket/20170310_160404.jpg";
import eket31 from "@/assets/eket/IMG_20170604_074952.jpg";
import eket32 from "@/assets/eket/20170301_182303.jpg";
import eket33 from "@/assets/eket/20170303_102750.jpg";
import eket34 from "@/assets/eket/20170303_193907.jpg";
import eket35 from "@/assets/eket/20170310_182035.jpg";
import eket36 from "@/assets/eket/20170303_102805.jpg";
import eket37 from "@/assets/eket/20170303_193915.jpg";
import eket38 from "@/assets/eket/20170310_182048.jpg";

import tntj1 from "@/assets/tntj/SAM_1200.jpg";
import tntj2 from "@/assets/tntj/SAM_1202.jpg";
import tntj3 from "@/assets/tntj/SAM_1204.jpg";
import tntj4 from "@/assets/tntj/SAM_1209.jpg";
import tntj5 from "@/assets/tntj/SAM_1213.jpg";
import tntj6 from "@/assets/tntj/SAM_1215.jpg";
import tntj7 from "@/assets/tntj/SAM_1201.jpg";
import tntj8 from "@/assets/tntj/SAM_1203.jpg";
import tntj9 from "@/assets/tntj/SAM_1206.jpg";
import tntj10 from "@/assets/tntj/SAM_1210.jpg";
import tntj11 from "@/assets/tntj/SAM_1214.jpg";
import tntj12 from "@/assets/tntj/SAM_1216.jpg";

// import eket39 from "@/assets/eket/jpg";
// import eket40 from "@/assets/eket/jpg";
// import eket41 from "@/assets/eket/jpg";
// import eket42 from "@/assets/eket/jpg";
// import eket43 from "@/assets/eket/jpg";
// import eket44 from "@/assets/eket/jpg";
// import eket45 from "@/assets/eket/jpg";
// import eket46 from "@/assets/eket/jpg";
// import eket47 from "@/assets/eket/jpg";
// import eket48 from "@/assets/eket/jpg";
// import eket49 from "@/assets/eket/jpg";
// import eket50 from "@/assets/eket/jpg";
// import eket51 from "@/assets/eket/jpg";

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
    id: "2",
    year: "2014",
    title: "The New Tabernacle Of Jehovah",
    desc: "Professional Studio Installation",
    category: "Multimedia",
    media: [
      { type: "image", src: tntj1, isExternal: false },
      { type: "image", src: tntj2, isExternal: false },
      { type: "image", src: tntj3, isExternal: false },
      { type: "image", src: tntj4, isExternal: false },
      { type: "image", src: tntj5, isExternal: false },
      { type: "image", src: tntj6, isExternal: false },
      { type: "image", src: tntj7, isExternal: false },
      { type: "image", src: tntj8, isExternal: false },
      { type: "image", src: tntj9, isExternal: false },
      { type: "image", src: tntj10, isExternal: false },
      { type: "image", src: tntj11, isExternal: false },
      { type: "image", src: tntj12, isExternal: false },
    ],
  },
  {
    id: "3",
    year: "2016",
    title: "Word bride church",
    desc: "Advanced Studio Installation",
    category: "Multimedia",
    media: [{ type: "video", src: "/videos/bride.mp4", isExternal: false }],
  },
  {
    id: "4",
    year: "2018",
    title: "Mountain of Fire & Miracles Ministries Eket",
    desc: "Studio & Mobile Studio Design",
    category: "Multimedia",
    media: [
      // { type: "video", src: "/videos/eket1.mp4", isExternal: false },
      // there is an issue here
      { type: "image", src: eket1, isExternal: false },
      { type: "image", src: eket2, isExternal: false },
      { type: "image", src: eket3, isExternal: false },
      { type: "image", src: eket4, isExternal: false },
      { type: "image", src: eket5, isExternal: false },
      { type: "image", src: eket6, isExternal: false },
      { type: "image", src: eket7, isExternal: false },
      { type: "image", src: eket9, isExternal: false },
      { type: "image", src: eket10, isExternal: false },
      { type: "image", src: eket11, isExternal: false },
      { type: "image", src: eket12, isExternal: false },
      { type: "image", src: eket13, isExternal: false },
      { type: "image", src: eket14, isExternal: false },
      { type: "image", src: eket15, isExternal: false },
      { type: "image", src: eket16, isExternal: false },
      { type: "image", src: eket17, isExternal: false },
      { type: "image", src: eket18, isExternal: false },
      { type: "image", src: eket19, isExternal: false },
      { type: "image", src: eket20, isExternal: false },
      { type: "image", src: eket21, isExternal: false },
      { type: "image", src: eket22, isExternal: false },
      { type: "image", src: eket23, isExternal: false },
      { type: "image", src: eket24, isExternal: false },
      { type: "image", src: eket25, isExternal: false },
      { type: "image", src: eket26, isExternal: false },
      { type: "image", src: eket27, isExternal: false },
      { type: "image", src: eket28, isExternal: false },
      { type: "image", src: eket29, isExternal: false },
      { type: "image", src: eket30, isExternal: false },
      { type: "image", src: eket31, isExternal: false },
      { type: "image", src: eket32, isExternal: false },
      { type: "image", src: eket33, isExternal: false },
      { type: "image", src: eket34, isExternal: false },
      { type: "image", src: eket35, isExternal: false },
      { type: "image", src: eket36, isExternal: false },
      { type: "image", src: eket37, isExternal: false },
      { type: "image", src: eket38, isExternal: false },
    ],
  },
  {
    id: "5",
    year: "2019",
    title: "Niger State Governorship Election",
    desc: "E-campaign Infrastructure & Mobile Studio",
    category: "IT & Media",
    media: [
      { type: "image", src: niger1, isExternal: false },
      { type: "image", src: niger6, isExternal: false },
      { type: "image", src: niger7, isExternal: false },
      { type: "image", src: niger8, isExternal: false },
      { type: "image", src: niger9, isExternal: false },
      { type: "image", src: niger10, isExternal: false },
      { type: "image", src: niger11, isExternal: false },
      { type: "image", src: niger12, isExternal: false },
      { type: "image", src: niger13, isExternal: false },
      { type: "image", src: niger14, isExternal: false },
      { type: "image", src: niger15, isExternal: false },
      { type: "image", src: niger16, isExternal: false },
      { type: "image", src: niger17, isExternal: false },
      { type: "image", src: niger18, isExternal: false },
      { type: "image", src: niger19, isExternal: false },
      { type: "image", src: niger20, isExternal: false },
      { type: "image", src: niger21, isExternal: false },
      { type: "image", src: niger22, isExternal: false },
      { type: "image", src: niger23, isExternal: false },
      { type: "image", src: niger24, isExternal: false },
      { type: "image", src: niger25, isExternal: false },
      { type: "image", src: niger26, isExternal: false },
      { type: "image", src: niger27, isExternal: false },
      { type: "image", src: niger28, isExternal: false },
      { type: "image", src: niger29, isExternal: false },
      { type: "image", src: niger30, isExternal: false },
      { type: "image", src: niger31, isExternal: false },
      { type: "image", src: niger32, isExternal: false },
      { type: "image", src: niger33, isExternal: false },
    ],
  },
  {
    id: "7",
    year: "2024",
    title: "AKEES Akwa Ibom State Government",
    desc: "Database Design & Management",
    category: "IT",
    media: [
      { type: "image", src: akees1, isExternal: false },
      { type: "image", src: akees2, isExternal: false },
      { type: "video", src: "/videos/akees.mp4", isExternal: false },
    ],
  },
  {
    id: "8",
    year: "2011",
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
                      <button className="mt-3 bg-white rounded-md text-black text-sm px-2 py-1 cursor-pointer">
                        See details
                      </button>
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
