"use client";
import { motion } from 'framer-motion';
import { Calendar, MapPin, CheckCircle2 } from 'lucide-react';

const projects = [
  {
    year: "2011",
    title: "Living Faith Church Uyo",
    desc: "Digital Multimedia Studio Installation",
    category: "Multimedia"
  },
  {
    year: "2014",
    title: "RCCG Provincial HQ Port Harcourt",
    desc: "Professional Studio Installation",
    category: "Multimedia"
  },
  {
    year: "2016",
    title: "Salvation Ministries Port Harcourt",
    desc: "Advanced Studio Installation",
    category: "Multimedia"
  },
  {
    year: "2018",
    title: "Mountain of Fire & Miracles Ministries Calabar",
    desc: "Studio & Mobile Studio Design",
    category: "Multimedia"
  },
  {
    year: "2019",
    title: "Niger State Governorship Election",
    desc: "E-campaign Infrastructure & Mobile Studio",
    category: "IT & Media"
  },
  {
    year: "2022",
    title: "Nigerian Police Force IGP Squad Uyo",
    desc: "Advanced Surveillance Systems Installation",
    category: "Security"
  },
  {
    year: "2023",
    title: "Nigerpet Construction",
    desc: "Comprehensive CCTV Installation",
    category: "Security"
  },
  {
    year: "2024",
    title: "AKEES Akwa Ibom State Government",
    desc: "Database Design & Management",
    category: "IT"
  }
];

export default function Projects() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6">Our <span className="text-primary">Milestones</span></h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            A legacy of excellence across government, religious, and corporate sectors.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12">
            {projects.map((project, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 w-full md:w-1/2 px-8">
                  <div className={`glass-card p-8 rounded-3xl border-l-4 ${idx % 2 === 0 ? 'border-l-primary' : 'border-l-secondary'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary font-bold flex items-center">
                        <Calendar className="w-4 h-4 mr-2" /> {project.year}
                      </span>
                      <span className="px-3 py-1 bg-surface rounded-full text-xs font-bold text-textSecondary uppercase tracking-wider">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                    <p className="text-textSecondary">{project.desc}</p>
                  </div>
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
