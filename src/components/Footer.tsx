import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-left gap-2"><a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-printa-black text-white hover:bg-printa-red transition-colors">
            <Facebook size={18} />
          </a>
            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-printa-black text-white hover:bg-printa-red transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-printa-black text-white hover:bg-printa-red transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-printa-black text-white hover:bg-printa-red transition-colors">
              <Linkedin size={18} />
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link to="/how-it-works" className="hover:text-printa-red transition-colors">How it works</Link>
            <Link to="/pricing" className="hover:text-printa-red transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-printa-red transition-colors">Login</Link>
          </div>
          <p className="text-sm text-gray-700">Print<span className="text-printa-red"> Anything, </span>Anywhere</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;