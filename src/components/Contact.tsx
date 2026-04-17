'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Clock, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ContactSettings = {
  address_line1: string; address_line2: string;
  phone: string; email: string;
  hours_weekdays: string; hours_weekend: string;
};

const DEFAULT: ContactSettings = {
  address_line1: '123 Nguyễn Huệ, Quận 1',
  address_line2: 'TP. Hồ Chí Minh',
  phone: '0901 234 567',
  email: 'info@manhcuonggym.vn',
  hours_weekdays: 'Thứ 2 – 6: 5:00 – 22:00',
  hours_weekend: 'Thứ 7 – CN: 6:00 – 21:00',
};

export default function Contact() {
  const supabase = createClient();
  const [settings, setSettings] = useState<ContactSettings>(DEFAULT);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  useEffect(() => {
    supabase.from('contact_settings').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setSettings(data); });
  }, []);

  const info = [
    { icon: MapPin, title: 'Địa Chỉ', lines: [settings.address_line1, settings.address_line2].filter(Boolean) },
    { icon: Phone,  title: 'Liên Hệ', lines: [settings.phone, settings.email].filter(Boolean) },
    { icon: Clock,  title: 'Giờ Mở Cửa', lines: [settings.hours_weekdays, settings.hours_weekend].filter(Boolean) },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contact" className="relative py-32 bg-[#060e1c]/50 overflow-hidden">
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full bg-[#E8192C]/5 blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-16 anim-up">
          <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">Liên Hệ</span>
          </div>
          <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white">
            Bắt Đầu Hành Trình<br/><span className="text-[#E8192C]">Của Bạn</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8 anim-left">
            <p className="font-['DM_Sans'] text-white/60 leading-relaxed">Đặt lịch tập thử miễn phí hoặc tư vấn trực tiếp với đội ngũ của chúng tôi.</p>
            {info.map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="w-12 h-12 bg-[#E8192C]/10 border border-[#E8192C]/20 flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-[#E8192C]" />
                </div>
                <div>
                  <div className="font-['Barlow_Condensed'] font-bold text-white uppercase tracking-wider mb-1">{item.title}</div>
                  {item.lines.map(line => <div key={line} className="font-['DM_Sans'] text-sm text-white/50">{line}</div>)}
                </div>
              </div>
            ))}
            <div className="bg-[#E8192C]/8 border border-[#E8192C]/20 p-6">
              <div className="font-['Barlow_Condensed'] font-bold text-xl text-white uppercase mb-2">Thử Miễn Phí 7 Ngày</div>
              <p className="font-['DM_Sans'] text-xs text-white/50">Trải nghiệm toàn bộ tiện ích không cần thẻ tín dụng.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5 anim-right">
            <div className="grid sm:grid-cols-2 gap-5">
              {[{ key: 'name', label: 'Họ & Tên', placeholder: 'Nguyễn Văn A', type: 'text' },
                { key: 'email', label: 'Email', placeholder: 'email@example.com', type: 'email' }].map(field => (
                <div key={field.key}>
                  <label className="block font-['DM_Sans'] text-xs text-white/50 uppercase tracking-wider mb-2">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} required
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full bg-[#0f1e35] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-5 py-3.5 outline-none transition-colors duration-200" />
                </div>
              ))}
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs text-white/50 uppercase tracking-wider mb-2">Số Điện Thoại</label>
              <input type="tel" placeholder="0901 234 567" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-[#0f1e35] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-5 py-3.5 outline-none transition-colors duration-200" />
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs text-white/50 uppercase tracking-wider mb-2">Tin Nhắn</label>
              <textarea rows={5} required placeholder="Bạn muốn bắt đầu như thế nào?"
                value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-[#0f1e35] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-5 py-3.5 outline-none transition-colors duration-200 resize-none" />
            </div>
            <button type="submit"
              className={`w-full flex items-center justify-center gap-3 font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest py-4 transition-all duration-300 active:scale-95 ${sent ? 'bg-green-600 text-white' : 'bg-[#E8192C] hover:bg-[#c4152a] text-white'}`}>
              {sent ? 'Đã Gửi Thành Công!' : <><span>Gửi Tin Nhắn</span><Send size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
