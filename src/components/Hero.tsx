'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type Stat = { value: string; label: string };

const DEFAULT_STATS: Stat[] = [
  { value: '2,500+', label: 'Hội Viên' },
  { value: '50+',    label: 'Lớp / Tuần' },
  { value: '15+',    label: 'HLV Chuyên Nghiệp' },
  { value: '8',      label: 'Năm Kinh Nghiệm' },
];

const DEFAULT_HERO = {
  headline: 'Rèn Luyện Thân Thể & Tâm Trí',
  subtext: 'Phòng gym & yoga đẳng cấp với huấn luyện viên chuyên nghiệp. Biến đổi bản thân, nâng cao sức khỏe và tìm lại sự cân bằng trong cuộc sống.',
  bg_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=75&auto=format&fit=crop',
};

export default function Hero() {
  const supabase = createClient();
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);

  useEffect(() => {
    supabase.from('hero_content').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setHero(data); });

    supabase.from('stats').select('*').order('sort_order')
      .then(({ data }) => { if (data && data.length > 0) setStats(data); });
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={hero.bg_image_url}
          alt="Gym hero" fill priority className="object-cover object-center" sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#04080f]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04080f] via-[#04080f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#E8192C]/10 blur-[120px]" />
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none overflow-hidden">
        <span className="anim-fade anim-d5 font-['Barlow_Condensed'] font-black text-[22vw] uppercase text-white/[0.04] leading-none whitespace-nowrap">POWER</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12 w-full">
        <div className="max-w-4xl">
          <div className="anim-up anim-d2 inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#E8192C] animate-pulse" />
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">Premium Gym & Yoga Studio</span>
          </div>

          <h1 className="anim-up anim-d3 font-['Barlow_Condensed'] font-black uppercase leading-[0.9] text-[clamp(4rem,12vw,11rem)] mb-6">
            <span className="block text-white">Rèn Luyện</span>
            <span className="block text-[#E8192C]">Thân Thể</span>
            <span className="block text-white/20 italic text-[0.75em]">& Tâm Trí</span>
          </h1>

          <p className="anim-up anim-d4 font-['DM_Sans'] text-white/60 text-lg max-w-xl mb-10 leading-relaxed">
            {hero.subtext}
          </p>

          <div className="anim-up anim-d5 flex flex-wrap items-center gap-4">
            <button onClick={() => scrollTo('#pricing')}
              className="flex items-center gap-3 bg-[#E8192C] hover:bg-[#c4152a] active:bg-[#a01020] text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest px-10 py-4 transition-colors">
              Đăng Ký Ngay <ArrowRight size={20} />
            </button>
            <button onClick={() => scrollTo('#classes')}
              className="flex items-center gap-3 border border-white/30 hover:border-white/60 active:border-white text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest px-10 py-4 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Play size={12} fill="white" />
              </div>
              Xem Lớp Học
            </button>
          </div>
        </div>

        <div className="anim-up anim-d8 mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#04080f]/80 px-8 py-6">
              <div className="font-['Barlow_Condensed'] font-black text-[2.5rem] text-[#E8192C] leading-none">{s.value}</div>
              <div className="font-['DM_Sans'] text-sm text-white/50 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="anim-fade anim-d9 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-['DM_Sans'] text-xs text-white/30 uppercase tracking-[0.3em]">Cuộn</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#E8192C] to-transparent animate-bounce" />
      </div>
    </section>
  );
}
