import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: White form side */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-block mb-6 md:mb-10">
            <img src="/printa-logo-red.webp" alt="Printa" className="h-14" />
          </Link>

          {children}
        </div>
      </motion.div>

      {/* Right: Red branding panel — inset with rounded left corners */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hidden lg:flex flex-1 p-8"
      >
        <div className="flex-1 bg-printa-red rounded-r-[2.5rem] rounded-l-[2.5rem] relative overflow-hidden flex flex-col justify-between p-10">
          {/* Decorative starburst */}
          <svg className="absolute top-6 right-8 w-20 h-20 text-white/10" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
          </svg>
          <svg className="absolute bottom-20 left-8 w-14 h-14 text-white/10" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
          </svg>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/5" />

          {/* Top: heading */}
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage<br /> Your printing.
            </h2>
          </div>

          {/* Middle: testimonial */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <Quote size={36} className="text-white/30 mb-4 rotate-180" />
            <p className="text-white text-lg font-medium leading-relaxed mb-6">
              Printa changed how I run my shop. Orders come in automatically, I see everything on one screen, and my customers love the speed.
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">Chanda Mwila</p>
                <p className="text-white/60 text-xs">Owner, Downtown Stationery</p>
              </div>
              {/* Nav arrows */}
              <div className="flex items-center gap-2">
                <button className="h-9 w-9 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button className="h-9 w-9 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: CTA card */}
          <div className="relative z-10 bg-black  backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4">
            {/* Avatar stack */}
            <div className="flex -space-x-2 flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-white/30 border-2 border-printa-red flex items-center justify-center text-[10px] font-bold text-white">CM</div>
              <div className="h-9 w-9 rounded-full bg-white/40 border-2 border-printa-red flex items-center justify-center text-[10px] font-bold text-white">BM</div>
              <div className="h-9 w-9 rounded-full bg-white/20 border-2 border-printa-red flex items-center justify-center text-[10px] font-bold text-white">KB</div>
              <div className="h-9 w-9 rounded-full bg-white/30 border-2 border-printa-red flex items-center justify-center text-[10px] font-bold text-white">+5</div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Join 50+ vendors</p>
              <p className="text-white/60 text-xs">Already growing with Printa</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
