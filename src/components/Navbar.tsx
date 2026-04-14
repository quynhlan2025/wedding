'use client';

import { useState, useEffect } from 'react';
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#04080f]/95 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 active:opacity-70">
            <div className="w-8 h-8 bg-[#E8192C] flex items-center justify-center">
              <span className="font-['Barlow_Condensed'] font-black text-white text-lg leading-none">MC</span>
            </div>
            <span className="font-['Barlow_Condensed'] font-bold text-white text-2xl tracking-wider uppercase">
              Mạnh<span className="text-[#E8192C]">Cường</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button key={link.href} onClick={() => scrollTo(link.href)}
                className="font-['DM_Sans'] text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-widest">
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex">
            <button onClick={() => scrollTo('#pricing')}
              className="bg-[#E8192C] hover:bg-[#c4152a] active:bg-[#a01020] text-white font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest px-8 py-2.5 transition-colors">
              Tập Ngay
            </button>
          </div>

          <button className="md:hidden text-white p-2 active:opacity-70" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className="fixed inset-0 z-40 bg-[#04080f]/98 flex flex-col items-center justify-center gap-8"
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          visibility: mobileOpen ? 'visible' : 'hidden',
          transition: mobileOpen
            ? 'opacity 0.3s ease, visibility 0s 0s'
            : 'opacity 0.3s ease, visibility 0s 0.3s',
        }}
      >
        {links.map((link, i) => (
          <button key={link.href} onClick={() => scrollTo(link.href)}
            className="font-['Barlow_Condensed'] font-bold text-4xl uppercase tracking-widest text-white active:text-[#E8192C] transition-colors"
            style={{ transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms' }}>
            {link.label}
          </button>
        ))}
        <button onClick={() => scrollTo('#pricing')}
          className="mt-4 bg-[#E8192C] text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest px-12 py-3 active:bg-[#a01020]">
          Tập Ngay
        </button>
      </div>
    </>
  );
}
