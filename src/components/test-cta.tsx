"use client";

import { motion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import bgImage from "@/assets/text-cta-bg.jpg";

export default function TestimonialsCTA() {
  return (
    <section
      style={{ backgroundImage: `url(${bgImage.src})` }}
      className="py-24 bg-linear-to-b from-surface to-background relative overflow-hidden bg-cover bg-center bg-no-repeat text-black"
    >
      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Quote className="w-7 h-7 text-primary" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Hear What Our Clients Have to Say
          </h2>

          <p className="text-textSecondary text-lg max-w-2xl mx-auto mb-10">
            Real experiences from businesses and individuals who trust
            Visionspeaks for security, technology, and innovation.
          </p>

          <Link
            href="/testimonials"
            className="inline-flex items-center gap-3 px-10 py-4
                       bg-black text-white rounded-full font-bold text-lg
                       hover:bg-black/90 transition-all group"
          >
            View Testimonials
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* subtle background glow */}
      <div className="hero-glow bottom-0 left-1/2 -translate-x-1/2 opacity-40" />
    </section>
  );
}
