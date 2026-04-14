'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Clock, Send, Mail } from 'lucide-react';

const info = [
  {
    icon: MapPin,
    title: 'Địa Chỉ',
    lines: ['123 Nguyễn Huệ, Quận 1', 'TP. Hồ Chí Minh'],
  },
  {
    icon: Phone,
    title: 'Liên Hệ',
    lines: ['0901 234 567', 'info@ironyoga.vn'],
  },
  {
    icon: Clock,
    title: 'Giờ Mở Cửa',
    lines: ['Thứ 2 – 6: 5:00 – 22:00', 'Thứ 7 – CN: 6:00 – 21:00'],
  },
];

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contact" ref={ref} className="relative py-32 bg-[#060e1c]/50 overflow-hidden">
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full bg-[#E8192C]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">
              Liên Hệ
            </span>
          </div>
          <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white">
            Bắt Đầu Hành Trình<br/>
            <span className="text-[#E8192C]">Của Bạn</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 space-y-8"
          >
            <p className="font-['DM_Sans'] text-white/60 leading-relaxed">
              Đặt lịch tập thử miễn phí hoặc tư vấn trực tiếp với đội ngũ của chúng tôi.
              Chúng tôi sẵn sàng giúp bạn tìm ra chương trình phù hợp nhất.
            </p>

            {info.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 bg-[#E8192C]/10 border border-[#E8192C]/20 flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-[#E8192C]" />
                </div>
                <div>
                  <div className="font-['Barlow_Condensed'] font-bold text-white uppercase tracking-wider mb-1">
                    {item.title}
                  </div>
                  {item.lines.map(line => (
                    <div key={line} className="font-['DM_Sans'] text-sm text-white/50">{line}</div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* CTA promo */}
            <div className="bg-[#E8192C]/8 border border-[#E8192C]/20 p-6">
              <div className="font-['Barlow_Condensed'] font-bold text-xl text-white uppercase mb-2">
                Thử Miễn Phí 7 Ngày
              </div>
              <p className="font-['DM_Sans'] text-xs text-white/50">
                Trải nghiệm toàn bộ tiện ích không cần thẻ tín dụng.
              </p>
            </div>
          </motion.div>

          {/* Form right */}
          <motion.form
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { key: 'name', label: 'Họ & Tên', placeholder: 'Nguyễn Văn A', type: 'text' },
                { key: 'email', label: 'Email', placeholder: 'email@example.com', type: 'email' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block font-['DM_Sans'] text-xs text-white/50 uppercase tracking-wider mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full bg-[#0f1e35] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-5 py-3.5 outline-none transition-colors duration-200"
                    required
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block font-['DM_Sans'] text-xs text-white/50 uppercase tracking-wider mb-2">
                Số Điện Thoại
              </label>
              <input
                type="tel"
                placeholder="0901 234 567"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-[#0f1e35] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-5 py-3.5 outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-['DM_Sans'] text-xs text-white/50 uppercase tracking-wider mb-2">
                Tin Nhắn
              </label>
              <textarea
                rows={5}
                placeholder="Bạn muốn bắt đầu như thế nào? Mục tiêu của bạn là gì?"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-[#0f1e35] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-5 py-3.5 outline-none transition-colors duration-200 resize-none"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full flex items-center justify-center gap-3 font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest py-4 transition-all duration-300 ${
                sent
                  ? 'bg-green-600 text-white'
                  : 'bg-[#E8192C] hover:bg-[#c4152a] text-white'
              }`}
            >
              {sent ? (
                'Đã Gửi Thành Công!'
              ) : (
                <>
                  Gửi Tin Nhắn
                  <Send size={18} />
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
