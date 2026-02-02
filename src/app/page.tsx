"use client";
import { motion } from "framer-motion";
import {
  Shield,
  Cpu,
  Video,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import preciouspic from "@/assets/pfp.jpg";
import Image from "next/image";
import ScrollDown from "@/components/scroll-down";
import TestimonialsCTA from "@/components/test-cta";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <ScrollDown />
        <div className="absolute inset-0 z-0">
          <video
            src="/videos/hero.mp4"
            className="w-full h-full object-cover opacity-30"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-linear-to-b from-background via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6 tracking-widest uppercase">
              Innovation in Motion
            </span>
            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">
              Now the <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent">Vision</span> is Speaking
            </h1>
            <p className="text-xl md:text-2xl text-textSecondary max-w-3xl mx-auto mb-12 leading-relaxed">
              Cutting-edge Multimedia, IT & Security Solutions for Africa and
              Beyond. We bridge the gap between technology and safety.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/services"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center group"
              >
                Our Services{" "}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-white rounded-full font-bold text-lg hover:bg-border transition-all"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="hero-glow top-1/4 left-1/4" />
        <div className="hero-glow bottom-1/4 right-1/4" />
      </section>

      {/* Quick Intro */}
      <section id="intro" className="py-24 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Excellence in Every Pixel & Protocol
              </h2>
              <p className="text-textSecondary text-lg leading-relaxed mb-8">
                Visionspeaks Multimedia Ltd is a premier technology firm
                offering world-class proactive remote CCTV surveillance,
                advanced IT infrastructure, and high-end multimedia production.
                Founded in 2011, we have grown into a multi-national force for
                innovation.
              </p>
              <div className="space-y-4">
                {[
                  "UK-Trained Security Expertise",
                  "24/7 Proactive Monitoring",
                  "Smart Home & Office Automation",
                  "Professional Media Production",
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden border border-border">
                <img
                  src="https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Tech Office"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary p-8 rounded-2xl hidden md:block">
                <p className="text-4xl font-black text-white">13+</p>
                <p className="text-white/80 font-medium">Years of Innovation</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Core Solutions</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">
              We provide integrated technology services designed for the modern
              world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "CCTV Monitoring",
                desc: "24/7 remote surveillance with instant incident alerts.",
              },
              {
                icon: Cpu,
                title: "IT Solutions",
                desc: "Advanced networking, software engineering & support.",
              },
              {
                icon: Video,
                title: "Multimedia",
                desc: "High-end film production and digital studio design.",
              },
              {
                icon: Smartphone,
                title: "Smart Systems",
                desc: "Full home and office automation & biometric access.",
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <service.icon className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-textSecondary leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Preview */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/3">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border-4 border-primary/20">
                <Image
                  src={preciouspic}
                  alt="Precious Akhiankore"
                  className="w-full h-full object-cover fill"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-4xl font-bold mb-2">Precious Akhiankore</h2>
              <p className="text-primary font-bold text-xl mb-6">
                Founder & CEO
              </p>
              <p className="text-textSecondary text-lg leading-relaxed mb-8 italic">
                "Our commitment is to bring world-class security standards to
                Nigeria. We don't just install cameras; we provide peace of mind
                through professional, UK-standard monitoring."
              </p>
              <Link
                href="/founder"
                className="inline-flex items-center text-primary font-bold hover:underline"
              >
                Read Full Profile <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <TestimonialsCTA />
    </div>
  );
}
