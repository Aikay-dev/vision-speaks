"use client";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import type { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL("https://visionspeaks.com"),
//   title: {
//     default: "Client Testimonials | Visionspeaks Multimedia Ltd",
//     template: "%s | Visionspeaks Multimedia Ltd",
//   },
//   description:
//     "Hear from our clients across religious, corporate, government, and private sectors about their experience with Visionspeaks Multimedia Ltd's security, media, and IT solutions.",
//   keywords: [
//     "Visionspeaks",
//     "Testimonials",
//     "Client Reviews",
//     "Customer Feedback",
//     "Multimedia Services Nigeria",
//     "Security Services Nigeria",
//     "IT Solutions Nigeria",
//     "Smart Home Clients",
//     "Corporate Video Production",
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
//     url: "https://visionspeaks.com/testimonials",
//     title: "Client Testimonials | Visionspeaks Multimedia Ltd",
//     description:
//       "Read what our clients say about Visionspeaks Multimedia Ltd. From CCTV monitoring to multimedia production and IT solutions, our clients trust our expertise.",
//     siteName: "Visionspeaks",
//     images: [
//       {
//         url: "/og-image-testimonials.jpg", // create a custom OG image for testimonials
//         width: 1200,
//         height: 630,
//         alt: "Client Testimonials Visionspeaks",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Client Testimonials | Visionspeaks Multimedia Ltd",
//     description:
//       "Discover why our clients in religious, corporate, and government sectors trust Visionspeaks Multimedia Ltd for security, IT, and media services.",
//     images: ["/og-image-testimonials.jpg"],
//   },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

const testimonials = [
  {
    name: "Pastor David O.",
    org: "Religious Organization",
    text: "The multimedia studio installation by Visionspeaks transformed our broadcast quality. Their attention to detail in sound design is unmatched.",
  },
  {
    name: "Engr. Ahmed K.",
    org: "Government Agency",
    text: "Their proactive CCTV monitoring system has significantly reduced security incidents in our facility. The instant alert system is a game-changer.",
  },
  {
    name: "Mrs. Chioma A.",
    org: "Estate Manager",
    text: "We integrated their smart estate security solution. The biometric access control and motorized gates have made our community much safer.",
  },
  {
    name: "Dr. Samuel E.",
    org: "Private Hospital",
    text: "The Biometric Hospital Management System they installed streamlined our patient records and staff attendance perfectly.",
  },
  {
    name: "Barrister Tunde W.",
    org: "Corporate Client",
    text: "Visionspeaks handled our office automation. From smart lighting to IP intercoms, everything works seamlessly. Highly professional team.",
  },
  {
    name: "Chief Okon B.",
    org: "Business Owner",
    text: "Their mobile studio services for our corporate documentary were top-notch. The final production quality rivaled international standards.",
  },
];

export default function Testimonials() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6">
            Client <span className="text-primary">Voices</span>
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our partners say about
            our commitment to excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card p-10 rounded-3xl relative"
            >
              <Quote className="absolute top-6 right-6 text-primary/20 w-12 h-12" />
              <div className="flex mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-5 h-5 text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <p className="text-textSecondary text-lg leading-relaxed mb-8 italic">
                "{t.text}"
              </p>
              <div>
                <h4 className="font-bold text-xl">{t.name}</h4>
                <p className="text-primary text-sm font-medium">{t.org}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
