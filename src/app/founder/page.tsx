"use client";
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Youtube, Facebook, Award, ShieldCheck, Globe } from 'lucide-react';

export default function Founder() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/3"
          >
            <div className="sticky top-32">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden mb-8 border-4 border-primary/20">
                <img 
                  src="https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Precious Akhiankore" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="glass-card p-8 rounded-2xl space-y-6">
                <h3 className="text-xl font-bold border-b border-border pb-4">Contact Details</h3>
                <div className="space-y-4">
                  <a href="tel:+447917063185" className="flex items-center space-x-3 text-textSecondary hover:text-primary transition-colors">
                    <Phone size={20} className="text-primary" />
                    <span>+44 7917 063185</span>
                  </a>
                  <a href="tel:08033825615" className="flex items-center space-x-3 text-textSecondary hover:text-primary transition-colors">
                    <Phone size={20} className="text-primary" />
                    <span>0803 382 5615</span>
                  </a>
                  <a href="mailto:Visionspeaks.multimedia@gmail.com" className="flex items-center space-x-3 text-textSecondary hover:text-primary transition-colors">
                    <Mail size={20} className="text-primary" />
                    <span className="text-sm">Visionspeaks.multimedia@gmail.com</span>
                  </a>
                </div>
                <div className="flex space-x-4 pt-4">
                  <a href="#" className="p-3 bg-background rounded-xl hover:text-primary transition-colors"><Facebook /></a>
                  <a href="#" className="p-3 bg-background rounded-xl hover:text-primary transition-colors"><Youtube /></a>
                  <a href="#" className="p-3 bg-background rounded-xl hover:text-primary transition-colors"><Linkedin /></a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-2/3"
          >
            <h1 className="text-5xl font-black mb-2">Precious Akhiankore</h1>
            <p className="text-2xl text-primary font-bold mb-8">Founder & Managing Director</p>
            
            <div className="prose prose-invert max-w-none space-y-8">
              <div className="glass-card p-8 rounded-2xl border-l-4 border-l-primary">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Award className="mr-3 text-primary" /> Professional Profile
                </h3>
                <p className="text-textSecondary text-lg leading-relaxed">
                  Precious Akhiankore is a UK-trained and licensed CCTV & Surveillance Operative with extensive professional exposure to advanced monitoring systems, security protocols, and European operational standards. As a visionary leader, he is driving the implementation of modern, structured, high-quality CCTV monitoring services in Nigeria.
                </p>
              </div>

              <section>
                <h3 className="text-3xl font-bold mb-6">Message from the CEO</h3>
                <div className="space-y-6 text-textSecondary text-lg leading-relaxed">
                  <p>
                    Welcome to Visionspeaks Multimedia Ltd. Since our inception in 2011, our journey has been defined by a relentless pursuit of excellence and a commitment to bringing the highest standards of technology to Africa.
                  </p>
                  <p>
                    Having trained in the United Kingdom, I saw firsthand how technology, when properly managed and monitored, can transform security and business efficiency. My goal was to bring that same level of professionalism and proactive monitoring to Nigeria.
                  </p>
                  <p>
                    Today, Visionspeaks stands as a testament to that vision. We are not just a service provider; we are your partners in safety and innovation. Whether we are securing your home with smart technology or producing a world-class documentary, our focus remains on quality, reliability, and customer satisfaction.
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                <div className="p-6 bg-surface rounded-2xl border border-border">
                  <ShieldCheck className="text-primary w-10 h-10 mb-4" />
                  <h4 className="font-bold text-xl mb-2">UK Licensed</h4>
                  <p className="text-textSecondary">Certified surveillance operative with international training.</p>
                </div>
                <div className="p-6 bg-surface rounded-2xl border border-border">
                  <Globe className="text-secondary w-10 h-10 mb-4" />
                  <h4 className="font-bold text-xl mb-2">Global Vision</h4>
                  <p className="text-textSecondary">Bridging the gap between international standards and local needs.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
