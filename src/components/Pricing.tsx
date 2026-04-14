'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Cơ Bản',
    price: '599',
    period: '/tháng',
    desc: 'Hoàn hảo cho người mới bắt đầu',
    features: [
      'Truy cập khu gym chính',
      '2 lớp nhóm / tuần',
      'Tủ đồ cá nhân',
      'Hỗ trợ dinh dưỡng cơ bản',
      'Ứng dụng theo dõi tiến độ',
    ],
    notIncluded: ['PT 1-1', 'Yoga studio cao cấp', 'Spa & phục hồi'],
    popular: false,
    color: '#ffffff',
  },
  {
    name: 'Chuyên Nghiệp',
    price: '999',
    period: '/tháng',
    desc: 'Phổ biến nhất – trải nghiệm đầy đủ',
    features: [
      'Toàn bộ khu gym & yoga',
      'Lớp nhóm không giới hạn',
      '4 buổi PT 1-1 / tháng',
      'Tư vấn dinh dưỡng chuyên sâu',
      'Ứng dụng & kế hoạch cá nhân hóa',
      'Spa & phòng phục hồi',
    ],
    notIncluded: ['Huấn luyện VIP riêng'],
    popular: true,
    color: '#E8192C',
  },
  {
    name: 'Elite VIP',
    price: '1,999',
    period: '/tháng',
    desc: 'Dành cho những ai muốn tốt nhất',
    features: [
      'Tất cả quyền lợi Pro',
      'PT 1-1 không giới hạn',
      'Chương trình hoàn toàn cá nhân',
      'Dinh dưỡng & phục hồi VIP',
      'Phòng tập riêng tư',
      'Ưu tiên đặt lịch 24/7',
      'Hỗ trợ concierge cá nhân',
    ],
    notIncluded: [],
    popular: false,
    color: '#f59e0b',
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="pricing" ref={ref} className="relative py-32 bg-[#060e1c]/40 overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[800px] h-[400px] rounded-full bg-[#E8192C]/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">
              Gói Hội Viên
            </span>
          </div>
          <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white">
            Đầu Tư Cho<br/>
            <span className="text-[#E8192C]">Bản Thân</span>
          </h2>
          <p className="font-['DM_Sans'] text-white/50 mt-6 max-w-xl mx-auto">
            Không có hợp đồng ràng buộc. Hủy bất cứ lúc nào. Bắt đầu hành trình của bạn hôm nay.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`relative flex flex-col bg-[#0f1e35] border transition-all duration-300 overflow-hidden ${
                plan.popular
                  ? 'border-[#E8192C] shadow-[0_0_60px_rgba(232,25,44,0.2)] scale-105'
                  : 'border-white/8 hover:border-white/20'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-[#E8192C] py-2 text-center">
                  <span className="font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest text-white flex items-center justify-center gap-2">
                    <Zap size={14} fill="white" /> Phổ Biến Nhất
                  </span>
                </div>
              )}

              <div className={`p-8 flex flex-col flex-1 ${plan.popular ? 'pt-16' : ''}`}>
                {/* Plan header */}
                <div className="mb-8">
                  <h3 className="font-['Barlow_Condensed'] font-bold text-2xl uppercase text-white/60 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-['DM_Sans'] text-white/40 text-lg">₫</span>
                    <span
                      className="font-['Barlow_Condensed'] font-black text-6xl leading-none"
                      style={{ color: plan.color }}
                    >
                      {plan.price}
                    </span>
                    <span className="font-['DM_Sans'] text-white/40 text-sm">{plan.period}</span>
                  </div>
                  <p className="font-['DM_Sans'] text-xs text-white/40">{plan.desc}</p>
                </div>

                {/* Divider */}
                <div
                  className="h-px mb-8"
                  style={{ background: `linear-gradient(90deg, ${plan.popular ? '#E8192C' : 'rgba(255,255,255,0.1)'}, transparent)` }}
                />

                {/* Features */}
                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                      <span className="font-['DM_Sans'] text-sm text-white/70">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 opacity-30">
                      <div className="w-3.5 h-px mt-2.5 shrink-0 bg-white/30" />
                      <span className="font-['DM_Sans'] text-sm text-white/40 line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest py-4 transition-all duration-300 ${
                    plan.popular
                      ? 'bg-[#E8192C] text-white hover:bg-[#c4152a]'
                      : 'border border-white/20 text-white hover:border-[#E8192C] hover:text-[#E8192C]'
                  }`}
                >
                  Chọn Gói Này
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center font-['DM_Sans'] text-xs text-white/30 mt-8"
        >
          Giá đã bao gồm VAT. Dùng thử miễn phí 7 ngày cho tất cả gói.
        </motion.p>
      </div>
    </section>
  );
}
