"use client";
import { motion } from 'framer-motion';
import { FileText, Download, Shield, CheckCircle2 } from 'lucide-react';

export default function Downloads() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black mb-6">Resources</h1>
            <p className="text-xl text-textSecondary">
              Download our official documents and company profiles.
            </p>
          </div>

          <div className="glass-card p-12 rounded-3xl border-primary/20 flex flex-col md:flex-row items-center gap-12">
            <div className="w-32 h-32 bg-primary/10 rounded-3xl flex items-center justify-center shrink-0">
              <FileText className="text-primary w-16 h-16" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">Company Profile 2024</h2>
              <p className="text-textSecondary text-lg mb-8">
                Get a detailed overview of our services, team, past projects, and technical capabilities in one comprehensive document.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Service Catalog</span>
                </div>
                <div className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Technical Specs</span>
                </div>
                <div className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Project Portfolio</span>
                </div>
                <div className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Contact Info</span>
                </div>
              </div>
              <a 
                href="/company-profile.pdf" 
                download
                className="inline-flex items-center px-10 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all group"
              >
                Download Company Profile <Download className="ml-2 group-hover:translate-y-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="mt-16 p-8 bg-surface rounded-2xl border border-border flex items-center space-x-4">
            <Shield className="text-secondary w-8 h-8 shrink-0" />
            <p className="text-textSecondary text-sm">
              All documents are provided in PDF format. If you have trouble downloading, please contact our support team at Visionspeaks.multimedia@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
