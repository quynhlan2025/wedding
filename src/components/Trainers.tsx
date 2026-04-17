'use client';

import { useEffect, useState } from 'react';
import { Share2, Globe, Tv } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type Trainer = {
  id: string; name: string; role: string; photo_url: string;
  specialty: string; experience: string; certification: string; color: string;
};

export default function Trainers() {
  const supabase = createClient();
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    supabase.from('trainers').select('*').order('sort_order')
      .then(({ data }) => { if (data) setTrainers(data); });
  }, []);

  return (
    <section id="trainers" className="relative py-32 overflow-hidden">
      <div className="absolute left-1/4 bottom-0 w-[600px] h-[600px] rounded-full bg-[#E8192C]/5 blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16 anim-up">
          <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">Đội Ngũ</span>
          </div>
          <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white">
            Huấn Luyện Viên<br/><span className="text-[#E8192C]">Chuyên Nghiệp</span>
          </h2>
          <p className="font-['DM_Sans'] text-white/50 mt-6 max-w-xl mx-auto">
            Mỗi HLV là một chuyên gia trong lĩnh vực của họ, tận tâm giúp bạn đạt được mục tiêu.
          </p>
        </div>

        {trainers.length === 0 ? (
          <p className="text-center font-['DM_Sans'] text-white/30 py-12">Chưa có thông tin HLV.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer, i) => (
              <div key={trainer.id}
                className="card-hover group relative bg-[#060e1c] border border-white/8 overflow-hidden anim-up"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative h-72 overflow-hidden">
                  {trainer.photo_url
                    ? <Image src={trainer.photo_url} alt={trainer.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                    : <div className="w-full h-full bg-[#0f1e35] flex items-center justify-center">
                        <span className="font-['Barlow_Condensed'] font-black text-6xl text-white/20">{trainer.name[0]}</span>
                      </div>
                  }
                  <div className="absolute inset-0 opacity-20 mix-blend-color" style={{ backgroundColor: trainer.color }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060e1c] via-transparent to-transparent" />
                  {trainer.certification && (
                    <div className="absolute top-4 right-4 bg-[#04080f]/80 border border-white/10 px-3 py-1">
                      <span className="font-['DM_Sans'] text-xs text-white/60">{trainer.certification}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#04080f]/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {[Share2, Globe, Tv].map((Icon, j) => (
                      <div key={j} className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-[#E8192C] hover:text-[#E8192C] transition-colors">
                        <Icon size={16} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-['Barlow_Condensed'] font-bold text-2xl uppercase text-white mb-1">{trainer.name}</h3>
                  <p className="font-['DM_Sans'] text-xs uppercase tracking-widest mb-3" style={{ color: trainer.color }}>{trainer.role}</p>
                  <p className="font-['DM_Sans'] text-xs text-white/40 mb-3">{trainer.specialty}</p>
                  <div className="h-px mb-3" style={{ background: `linear-gradient(90deg, ${trainer.color}, transparent)` }} />
                  {trainer.experience && (
                    <span className="font-['DM_Sans'] text-xs text-white/30">{trainer.experience} kinh nghiệm</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
