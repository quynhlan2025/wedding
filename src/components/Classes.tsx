'use client';

import { useEffect, useState } from 'react';
import { Clock, Users, Flame, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type Class = {
  id: string; category: string; name: string; description: string;
  duration: string; level: string; calories: string; icon: string; image_url: string;
};

const CATEGORIES = ['Tất Cả', 'Gym', 'Yoga', 'Cardio', 'Đặc Biệt'];

export default function Classes() {
  const supabase = createClient();
  const [classes, setClasses] = useState<Class[]>([]);
  const [active, setActive] = useState('Tất Cả');

  useEffect(() => {
    supabase.from('classes').select('*').order('sort_order')
      .then(({ data }) => { if (data) setClasses(data); });
  }, []);

  const filtered = active === 'Tất Cả' ? classes : classes.filter(c => c.category === active);

  // Build category list from available data + default
  const availableCategories = ['Tất Cả', ...Array.from(new Set(classes.map(c => c.category)))];
  const cats = availableCategories.length > 1 ? availableCategories : CATEGORIES;

  return (
    <section id="classes" className="relative py-32 bg-[#060e1c]/50 overflow-hidden">
      <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-[#E8192C]/5 blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="anim-up">
            <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
              <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">Chương Trình</span>
            </div>
            <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white">
              Lớp Học<br/><span className="text-[#E8192C]">Của Chúng Tôi</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {cats.map(cat => (
              <button key={cat} onClick={() => setActive(cat)}
                className={`font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest px-5 py-2 border transition-all duration-200 ${active === cat ? 'bg-[#E8192C] border-[#E8192C] text-white' : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 && (
            <p className="col-span-3 text-center font-['DM_Sans'] text-white/30 py-12">Chưa có lớp học nào.</p>
          )}
          {filtered.map((cls, i) => (
            <div key={cls.id}
              className="card-hover group relative bg-[#0f1e35] border border-white/8 overflow-hidden anim-up"
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className="relative h-44 overflow-hidden">
                {cls.image_url
                  ? <Image src={cls.image_url} alt={cls.name} fill className="object-cover object-center group-hover:scale-110 transition-transform duration-700" />
                  : <div className="w-full h-full bg-[#060e1c] flex items-center justify-center text-5xl">{cls.icon}</div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e35] via-[#0f1e35]/40 to-transparent" />
                <span className="absolute bottom-4 left-4 text-3xl">{cls.icon}</span>
              </div>
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-['DM_Sans'] text-xs text-[#E8192C] uppercase tracking-widest border border-[#E8192C]/30 px-3 py-1">{cls.category}</span>
                </div>
                <h3 className="font-['Barlow_Condensed'] font-bold text-3xl uppercase text-white mb-3 group-hover:text-[#E8192C] transition-colors duration-300">{cls.name}</h3>
                <p className="font-['DM_Sans'] text-sm text-white/50 leading-relaxed mb-6">{cls.description}</p>
                <div className="w-12 h-px bg-[#E8192C] mb-6 group-hover:w-full transition-all duration-500" />
                <div className="flex items-center gap-4 text-white/40 text-xs font-['DM_Sans']">
                  <span className="flex items-center gap-1.5"><Clock size={12}/>{cls.duration}</span>
                  <span className="flex items-center gap-1.5"><Users size={12}/>{cls.level}</span>
                  <span className="flex items-center gap-1.5"><Flame size={12}/>{cls.calories} kcal</span>
                </div>
                <div className="absolute bottom-6 right-6 w-10 h-10 bg-[#E8192C] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight size={16} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="font-['DM_Sans'] text-white/40 mb-4">Còn nhiều lớp học khác đang chờ bạn</p>
          <button onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest text-[#E8192C] border border-[#E8192C]/40 px-10 py-3 hover:bg-[#E8192C] hover:text-white transition-all duration-300">
            Xem Toàn Bộ Lịch
          </button>
        </div>
      </div>
    </section>
  );
}
