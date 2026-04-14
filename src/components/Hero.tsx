'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';

const stats = [
  { value: '2,500+', label: 'Hội Viên' },
  { value: '50+',    label: 'Lớp / Tuần' },
  { value: '15+',    label: 'HLV Chuyên Nghiệp' },
  { value: '8',      label: 'Năm Kinh Nghiệm' },
];

export default function Hero() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&q=80&auto=format&fit=crop"
          alt="Gym hero"
          fill priority
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#04080f]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04080f] via-[#04080f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#E8192C]/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* ── BG word ── */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none overflow-hidden">
        <span className="anim-fade anim-d5 font-['Barlow_Condensed'] font-black text-[22vw] uppercase text-white/[0.04] leading-none whitespace-nowrap">
          POWER
        </span>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12 w-full">
        <div className="max-w-4xl">

          {/* Badge — CSS animation */}
          <div className="anim-up anim-d2 inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#E8192C] animate-pulse" />
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">
              Premium Gym & Yoga Studio
            </span>
          </div>

          {/* Headline — CSS animation */}
          <h1 className="anim-up anim-d3 font-['Barlow_Condensed'] font-black uppercase leading-[0.9] text-[clamp(4rem,12vw,11rem)] mb-6">
            <span className="block text-white">Rèn Luyện</span>
            <span className="block text-[#E8192C]">Thân Thể</span>
            <span className="block text-white/20 italic text-[0.75em]">& Tâm Trí</span>
          </h1>

          {/* Sub — CSS animation */}
          <p className="anim-up anim-d4 font-['DM_Sans'] text-white/60 text-lg max-w-xl mb-10 leading-relaxed">
            Phòng gym & yoga đẳng cấp với huấn luyện viên chuyên nghiệp. Biến đổi bản thân,
            nâng cao sức khỏe và tìm lại sự cân bằng trong cuộc sống.
          </p>

          {/* CTAs — CSS animation, Framer Motion chỉ cho hover */}
          <div className="anim-up anim-d5 flex flex-wrap items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('#pricing')}
              className="group flex items-center gap-3 bg-[#E8192C] hover:bg-[#c4152a] text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest px-10 py-4 transition-colors duration-200"
            >
              Đăng Ký Ngay
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('#classes')}
              className="group flex items-center gap-3 border border-white/20 hover:border-white/50 text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest px-10 py-4 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#E8192C] transition-colors">
                <Play size={12} fill="white" />
              </div>
              Xem Lớp Học
            </motion.button>
          </div>
        </div>

        {/* Stats Bar — CSS animation */}
        <div className="anim-up anim-d8 mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[#04080f]/80 px-8 py-6 hover:bg-[#060e1c] transition-colors duration-300"
            >
              <div className="font-['Barlow_Condensed'] font-black text-[2.5rem] text-[#E8192C] leading-none">
                {s.value}
              </div>
              <div className="font-['DM_Sans'] text-sm text-white/50 mt-1 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="anim-fade anim-d9 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-['DM_Sans'] text-xs text-white/30 uppercase tracking-[0.3em]">Cuộn</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-[#E8192C] to-transparent"
        />
      </div>
    </section>
  );
}
