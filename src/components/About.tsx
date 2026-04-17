'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type AboutContent = {
  title: string;
  description: string;
  years_experience: string;
  features: string[];
  main_image_url: string;
  secondary_image_url: string;
};

const DEFAULT: AboutContent = {
  title: 'Nơi Giới Hạn Bị Phá Vỡ',
  description: 'CLB GYM Mạnh Cường không chỉ là phòng gym — đây là nơi bạn khám phá phiên bản tốt nhất của chính mình. Với đội ngũ HLV tận tâm và thiết bị hiện đại, chúng tôi cam kết đồng hành cùng bạn trên từng bước của hành trình rèn luyện sức khoẻ.',
  years_experience: '8+',
  features: [
    'Thiết bị hiện đại nhập khẩu từ châu Âu',
    'Huấn luyện viên được chứng nhận quốc tế',
    'Chương trình tập cá nhân hóa 100%',
    'Dinh dưỡng & phục hồi chuyên nghiệp',
    'Cộng đồng tích cực, hỗ trợ lẫn nhau',
    'Mở cửa 24/7 – tập lúc nào cũng được',
  ],
  main_image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=80&auto=format&fit=crop',
  secondary_image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80&auto=format&fit=crop',
};

export default function About() {
  const supabase = createClient();
  const [content, setContent] = useState<AboutContent>(DEFAULT);

  useEffect(() => {
    supabase.from('about_content').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setContent({
          title: data.title || DEFAULT.title,
          description: data.description || DEFAULT.description,
          years_experience: data.years_experience || DEFAULT.years_experience,
          features: data.features?.length ? data.features : DEFAULT.features,
          main_image_url: data.main_image_url || DEFAULT.main_image_url,
          secondary_image_url: data.secondary_image_url || DEFAULT.secondary_image_url,
        });
      });
  }, []);

  const titleParts = content.title.split(' ');
  const lastWord = titleParts.pop();
  const restOfTitle = titleParts.join(' ');

  return (
    <section id="about" className="relative py-32 overflow-hidden">
      <div className="absolute left-0 top-0 w-1/2 h-full bg-[#060e1c]/60" />
      <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-[#E8192C]/5 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left – Image */}
          <div className="relative anim-left">
            <div className="relative aspect-[4/5] overflow-hidden border border-white/8">
              <Image src={content.main_image_url}
                alt="Gym interior" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04080f]/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E8192C]" />
            </div>

            <div className="absolute -bottom-8 right-0 w-2/5 aspect-square border-4 border-[#04080f] overflow-hidden shadow-2xl">
              <Image src={content.secondary_image_url}
                alt="Yoga session" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-[#E8192C]/10" />
            </div>

            <div className="absolute top-8 -right-6 bg-[#E8192C] p-6 shadow-2xl">
              <div className="font-['Barlow_Condensed'] font-black text-5xl text-white leading-none">{content.years_experience}</div>
              <div className="font-['DM_Sans'] text-xs text-white/80 uppercase tracking-wider mt-1">Năm<br/>Kinh Nghiệm</div>
            </div>
            <div className="absolute -left-3 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-[#E8192C] to-transparent" />
          </div>

          {/* Right – Text */}
          <div className="anim-right">
            <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
              <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">Về CLB GYM Mạnh Cường</span>
            </div>
            <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white mb-6">
              {restOfTitle}<br/><span className="text-[#E8192C]">{lastWord}</span>
            </h2>
            <p className="font-['DM_Sans'] text-white/60 text-lg leading-relaxed mb-8">
              {content.description}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {content.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-[#E8192C] shrink-0" />
                  <span className="font-['DM_Sans'] text-sm text-white/70">{feature}</span>
                </div>
              ))}
            </div>
            <button onClick={() => document.querySelector('#classes')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border border-[#E8192C] text-[#E8192C] hover:bg-[#E8192C] hover:text-white font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest px-10 py-3 transition-all duration-300 active:scale-95">
              Khám Phá Lớp Học
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
