import Link from 'next/link';
import { Shield, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Image from "next/image";
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
               <Image src={logo} alt="LOGO" height={40} />
              <span className="text-xl font-bold tracking-tighter">VISIONSPEAKS</span>
            </Link>
            <p className="text-textSecondary leading-relaxed">
              Cutting-edge technological solutions in media, IT, and security industries. Protecting lives and assets across Africa and beyond.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-background rounded-full hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href="#" className="p-2 bg-background rounded-full hover:text-primary transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-textSecondary">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link href="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
              <li><Link href="/founder" className="hover:text-primary transition-colors">The Founder</Link></li>
              <li><Link href="/downloads" className="hover:text-primary transition-colors">Downloads</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-textSecondary">
              <li>CCTV Monitoring</li>
              <li>Smart Home Automation</li>
              <li>IT Solutions</li>
              <li>Multimedia Production</li>
              <li>Biometric Systems</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contact Info</h4>
            <ul className="space-y-4 text-textSecondary">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>ceo@visionspeakstech.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+44 7917 063185<br/>0803 382 5615</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>135 Great Horton Road, Bradford, UK</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-textSecondary text-sm">
          <p>© {new Date().getFullYear()} Visionspeaks Multimedia Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
