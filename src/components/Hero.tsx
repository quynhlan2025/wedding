'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';

const stats = [
  { value: '2,500+', label: 'Hội Viên' },
  { value: '50+', label: 'Lớp / Tuần' },
  { value: '15+', label: 'HLV Chuyên Nghiệp' },
  { value: '8', label: 'Năm Kinh Nghiệm' },
];

// Unsplash gym hero images (free, no key needed via direct photo URLs)
const heroImages = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1800&q=80&auto=format&fit=crop',
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with parallax */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 scale-110">
        <Image
          src={heroImages[0]}
          alt="Gym hero"
          fill
          priority
          className="object-cover object-center"
          unoptimized
        />
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-[#04080f]/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04080f] via-[#04080f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-transparent to-transparent" />
        {/* Red glow */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#E8192C]/10 blur-[120px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </motion.div>

      {/* Large background text */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none overflow-hidden">
        <motion.span
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.04, x: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="font-['Barlow_Condensed'] font-black text-[22vw] uppercase text-white leading-none whitespace-nowrap"
        >
          POWER
        </motion.span>
      </div>

      {/* Content */}
      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 w-full"
      >
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#E8192C] animate-pulse" />
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">
              Premium Gym & Yoga Studio
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-['Barlow_Condensed'] font-black uppercase leading-[0.9] text-[clamp(4rem,12vw,11rem)] mb-6"
          >
            <span className="block text-white">Rèn Luyện</span>
            <span className="block text-[#E8192C]">Thân Thể</span>
            <span className="block text-white/20 italic text-[0.75em]">& Tâm Trí</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="font-['DM_Sans'] text-white/60 text-lg max-w-xl mb-10 leading-relaxed"
          >
            Phòng gym & yoga đẳng cấp với huấn luyện viên chuyên nghiệp. Biến đổi bản thân,
            nâng cao sức khỏe và tìm lại sự cân bằng trong cuộc sống.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('#pricing')}
              className="group flex items-center gap-3 bg-[#E8192C] text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest px-10 py-4 transition-all duration-200"
            >
              Đăng Ký Ngay
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('#classes')}
              className="group flex items-center gap-3 border border-white/20 hover:border-white/50 text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest px-10 py-4 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#E8192C] transition-colors">
                <Play size={12} fill="white" />
              </div>
              Xem Lớp Học
            </motion.button>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="bg-[#04080f]/80 backdrop-blur-sm px-8 py-6 group hover:bg-[#060e1c] transition-colors duration-300"
            >
              <div className="font-['Barlow_Condensed'] font-black text-[2.5rem] text-[#E8192C] leading-none">
                {s.value}
              </div>
              <div className="font-['DM_Sans'] text-sm text-white/50 mt-1 uppercase tracking-wider">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-['DM_Sans'] text-xs text-white/30 uppercase tracking-[0.3em]">Cuộn</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-[#E8192C] to-transparent"
        />
      </motion.div>
    </section>
  );
}
