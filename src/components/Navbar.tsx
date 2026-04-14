'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Về Chúng Tôi', href: '#about' },
  { label: 'Lớp Học', href: '#classes' },
  { label: 'HLV', href: '#trainers' },
  { label: 'Bảng Giá', href: '#pricing' },
  { label: 'Liên Hệ', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#04080f]/95 backdrop-blur-md border-b border-white/5 py-3'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-[#E8192C] flex items-center justify-center">
                <span className="font-['Barlow_Condensed'] font-black text-white text-lg leading-none">MC</span>
              </div>
              <span className="font-['Barlow_Condensed'] font-bold text-white text-2xl tracking-wider uppercase">
                Mạnh<span className="text-[#E8192C]">Cường</span>
              </span>
            </motion.div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="animated-underline font-['DM_Sans'] text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 uppercase tracking-widest"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#c4152a' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollTo('#pricing')}
              className="bg-[#E8192C] text-white font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest px-8 py-2.5 transition-colors duration-200"
            >
              Tập Ngay
            </motion.button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-[#04080f]/98 flex flex-col items-center justify-center gap-8"
          >
            {links.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => scrollTo(link.href)}
                className="font-['Barlow_Condensed'] font-bold text-4xl uppercase tracking-widest text-white hover:text-[#E8192C] transition-colors duration-200"
              >
                {link.label}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: links.length * 0.07 }}
              onClick={() => scrollTo('#pricing')}
              className="mt-4 bg-[#E8192C] text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest px-12 py-3"
            >
              Tập Ngay
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
