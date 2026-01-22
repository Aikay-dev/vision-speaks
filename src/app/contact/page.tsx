"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // EmailJS integration placeholder
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6">Get in <span className="text-primary">Touch</span></h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Have a project in mind? Our team is ready to help you build the future.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-8">Contact Info</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Mail className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-textSecondary mb-1">Email Us</p>
                    <p className="font-bold">Visionspeaks.multimedia@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <Phone className="text-secondary w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-textSecondary mb-1">Call Us</p>
                    <p className="font-bold">+44 7917 063185</p>
                    <p className="font-bold">0803 382 5615</p>
                    <p className="font-bold">0808 178 2964</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-8">Our Offices</h3>
              <div className="space-y-8">
                <div>
                  <p className="text-primary font-bold mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> United Kingdom
                  </p>
                  <p className="text-textSecondary">135 Great Horton Road, Horon House, Bradford, UK</p>
                </div>
                <div>
                  <p className="text-secondary font-bold mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> Lagos, Nigeria
                  </p>
                  <p className="text-textSecondary">17 Unique Ave, Jackcross, Iyana Iyesi, Sango Ota</p>
                </div>
                <div>
                  <p className="text-accent font-bold mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> Akwa Ibom, Nigeria
                  </p>
                  <p className="text-textSecondary">35 Afahaube Rd, Off Ikot Ekpene Rd, Uyo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-10 rounded-3xl">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-success w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Message Sent!</h3>
                  <p className="text-textSecondary text-lg mb-8">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="px-8 py-3 bg-primary rounded-full font-bold"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-textSecondary">Full Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-background border border-border rounded-xl px-5 py-4 focus:border-primary outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-textSecondary">Email Address</label>
                      <input 
                        required
                        type="email" 
                        className="w-full bg-background border border-border rounded-xl px-5 py-4 focus:border-primary outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-textSecondary">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full bg-background border border-border rounded-xl px-5 py-4 focus:border-primary outline-none transition-colors"
                      placeholder="+234 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-textSecondary">Message</label>
                    <textarea 
                      required
                      rows={6}
                      className="w-full bg-background border border-border rounded-xl px-5 py-4 focus:border-primary outline-none transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button 
                    disabled={status === 'sending'}
                    type="submit" 
                    className="w-full py-5 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {status === 'sending' ? 'Sending...' : (
                      <>Send Message <Send className="ml-2 w-5 h-5" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
