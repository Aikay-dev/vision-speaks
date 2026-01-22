"use client";
import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';

const team = [
  {
    name: "Precious Akhiankore",
    role: "Founder / CEO / MD",
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    name: "Enobong A. Precious",
    role: "GM / Head: Customer Relations",
    image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    name: "Emmanuel Ene",
    role: "Head: Product Development / Marketing & Sales",
    image: "https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    name: "Enobong Odungide",
    role: "Head: System Analyst / Engineering",
    desc: "BEngr, MSc Cyber Forensics, CEH, CISM, CompTIA+, MCSA, CCNA",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    name: "Chidiebere Okoji",
    role: "Technical Director / Command Centre Administrator",
    desc: "BEngr Electrical & Electronic Engineering",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  }
];

export default function Team() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6">The <span className="text-primary">Experts</span></h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Our team of dedicated professionals has driven 300% growth in our first decade through innovation and technical excellence.
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
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary font-semibold mb-4">{member.role}</p>
                {member.desc && (
                  <p className="text-textSecondary text-sm mb-6">{member.desc}</p>
                )}
                <div className="flex space-x-4">
                  <a href="#" className="text-textSecondary hover:text-primary transition-colors"><Linkedin size={20} /></a>
                  <a href="#" className="text-textSecondary hover:text-primary transition-colors"><Mail size={20} /></a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
