'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  { name: 'Nguyễn Thị Mai', role: 'Marketing Manager', text: 'CLB GYM Mạnh Cường đã thay đổi hoàn toàn cuộc sống của tôi. Sau 6 tháng tập luyện, tôi không chỉ giảm được 15kg mà còn cảm thấy tự tin hơn rất nhiều trong công việc và cuộc sống hằng ngày.', initials: 'NM', rating: 5, months: '6 tháng' },
  { name: 'Trần Văn Hùng', role: 'Software Engineer', text: 'Là dân văn phòng ngồi cả ngày, lớp yoga buổi tối đã giúp tôi giải tỏa stress cực tốt. Các HLV ở đây rất tận tâm và chuyên nghiệp. Không gian tập cũng rất xịn xò.', initials: 'TH', rating: 5, months: '4 tháng' },
  { name: 'Lê Phương Linh', role: 'Entrepreneur', text: 'Gói Elite VIP hoàn toàn xứng đáng với số tiền bỏ ra. PT cá nhân của tôi biết chính xác tôi cần gì và luôn push tôi vượt qua giới hạn của bản thân một cách an toàn và hiệu quả.', initials: 'LL', rating: 5, months: '1 năm' },
  { name: 'Phạm Đức Minh', role: 'Doctor', text: 'Tôi đã thử nhiều phòng gym nhưng CLB GYM Mạnh Cường là nơi duy nhất tôi thực sự gắn bó. Sự kết hợp giữa gym và yoga giúp tôi có được vóc dáng cân đối mà tôi luôn mơ ước.', initials: 'DM', rating: 5, months: '8 tháng' },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[800px] bg-[#E8192C]/4 blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-16 anim-up">
          <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">Đánh Giá</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white">
              Câu Chuyện<br/><span className="text-[#E8192C]">Thành Công</span>
            </h2>
            <div className="flex gap-3">
              <button onClick={() => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length)}
                className="w-12 h-12 border border-white/20 hover:border-[#E8192C] flex items-center justify-center text-white hover:text-[#E8192C] transition-colors active:scale-90">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrent(c => (c + 1) % testimonials.length)}
                className="w-12 h-12 bg-[#E8192C] hover:bg-[#c4152a] flex items-center justify-center text-white transition-colors active:scale-90">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 anim-up anim-d2">
          <div className="bg-[#060e1c] border border-[#E8192C]/20 p-10 relative overflow-hidden">
            <div className="absolute top-6 right-8 font-['Barlow_Condensed'] font-black text-[8rem] text-[#E8192C]/8 leading-none select-none">"</div>
            <div className="flex gap-1 mb-6">
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <Star key={i} size={16} fill="#E8192C" className="text-[#E8192C]" />
              ))}
            </div>
            <p className="font-['DM_Sans'] text-white/80 text-lg leading-relaxed mb-8 relative z-10">"{testimonials[current].text}"</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E8192C]/20 border border-[#E8192C]/30 flex items-center justify-center">
                <span className="font-['Barlow_Condensed'] font-bold text-[#E8192C]">{testimonials[current].initials}</span>
              </div>
              <div>
                <div className="font-['Barlow_Condensed'] font-bold text-lg text-white uppercase">{testimonials[current].name}</div>
                <div className="font-['DM_Sans'] text-xs text-white/40">{testimonials[current].role} • {testimonials[current].months} tại CLB GYM Mạnh Cường</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {testimonials.map((t, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-full text-left p-5 border transition-all duration-300 ${i === current ? 'border-[#E8192C]/50 bg-[#E8192C]/5' : 'border-white/8 bg-[#060e1c] hover:border-white/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center text-sm font-['Barlow_Condensed'] font-bold shrink-0 ${i === current ? 'bg-[#E8192C] text-white' : 'bg-white/5 text-white/60'}`}>{t.initials}</div>
                  <div className="min-w-0">
                    <div className="font-['Barlow_Condensed'] font-bold text-white uppercase text-sm">{t.name}</div>
                    <div className="font-['DM_Sans'] text-xs text-white/40 truncate">{t.role}</div>
                  </div>
                  {i === current && <div className="ml-auto w-2 h-2 rounded-full bg-[#E8192C]" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-0.5 transition-all duration-300 ${i === current ? 'w-8 bg-[#E8192C]' : 'w-4 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
