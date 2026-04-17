'use client';

import { useEffect, useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Plan = {
  id: string; name: string; price: string; period: string; description: string;
  popular: boolean; color: string; features: string[]; not_included: string[];
};

export default function Pricing() {
  const supabase = createClient();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    supabase.from('pricing_plans').select('*').order('sort_order')
      .then(({ data }) => { if (data) setPlans(data); });
  }, []);

  return (
    <section id="pricing" className="relative py-32 bg-[#060e1c]/40 overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[800px] h-[400px] rounded-full bg-[#E8192C]/5 blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16 anim-up">
          <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
            <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">Gói Hội Viên</span>
          </div>
          <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white">
            Đầu Tư Cho<br/><span className="text-[#E8192C]">Bản Thân</span>
          </h2>
          <p className="font-['DM_Sans'] text-white/50 mt-6 max-w-xl mx-auto">
            Không có hợp đồng ràng buộc. Hủy bất cứ lúc nào. Bắt đầu hành trình của bạn hôm nay.
          </p>
        </div>

        {plans.length === 0 ? (
          <p className="text-center font-['DM_Sans'] text-white/30 py-12">Chưa có gói hội viên.</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, i) => (
              <div key={plan.id}
                className={`relative flex flex-col bg-[#0f1e35] border overflow-hidden anim-up ${plan.popular ? 'border-[#E8192C] shadow-[0_0_60px_rgba(232,25,44,0.2)] lg:scale-105' : 'border-white/8'}`}
                style={{ animationDelay: `${i * 150}ms` }}>
                {plan.popular && (
                  <div className="bg-[#E8192C] py-2 text-center">
                    <span className="font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest text-white flex items-center justify-center gap-2">
                      <Zap size={14} fill="white" /> Phổ Biến Nhất
                    </span>
                  </div>
                )}
                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-8">
                    <h3 className="font-['Barlow_Condensed'] font-bold text-2xl uppercase text-white/60 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="font-['DM_Sans'] text-white/40 text-lg">₫</span>
                      <span className="font-['Barlow_Condensed'] font-black text-6xl leading-none" style={{ color: plan.color }}>{plan.price}</span>
                      <span className="font-['DM_Sans'] text-white/40 text-sm">{plan.period}</span>
                    </div>
                    <p className="font-['DM_Sans'] text-xs text-white/40">{plan.description}</p>
                  </div>
                  <div className="h-px mb-8" style={{ background: `linear-gradient(90deg, ${plan.popular ? '#E8192C' : 'rgba(255,255,255,0.1)'}, transparent)` }} />
                  <div className="flex-1 space-y-4 mb-8">
                    {(plan.features ?? []).map(f => (
                      <div key={f} className="flex items-start gap-3">
                        <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                        <span className="font-['DM_Sans'] text-sm text-white/70">{f}</span>
                      </div>
                    ))}
                    {(plan.not_included ?? []).map(f => (
                      <div key={f} className="flex items-start gap-3 opacity-30">
                        <div className="w-3.5 h-px mt-2.5 shrink-0 bg-white/30" />
                        <span className="font-['DM_Sans'] text-sm text-white/40 line-through">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest py-4 transition-all duration-300 active:scale-95 ${plan.popular ? 'bg-[#E8192C] text-white hover:bg-[#c4152a]' : 'border border-white/20 text-white hover:border-[#E8192C] hover:text-[#E8192C]'}`}>
                    Chọn Gói Này
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-center font-['DM_Sans'] text-xs text-white/30 mt-8">Giá đã bao gồm VAT. Dùng thử miễn phí 7 ngày cho tất cả gói.</p>
      </div>
    </section>
  );
}
