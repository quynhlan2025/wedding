import { createClient } from '@/lib/supabase/server';
import { Dumbbell, Users, CreditCard, MessageSquare, BarChart2, Briefcase } from 'lucide-react';

async function getCount(supabase: Awaited<ReturnType<typeof createClient>>, table: string) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [services, classes, trainers, pricing, testimonials, stats] = await Promise.all([
    getCount(supabase, 'services'),
    getCount(supabase, 'classes'),
    getCount(supabase, 'trainers'),
    getCount(supabase, 'pricing_plans'),
    getCount(supabase, 'testimonials'),
    getCount(supabase, 'stats'),
  ]);

  const cards = [
    { label: 'Services',      count: services,     icon: Briefcase,     href: '/admin/services',     color: '#7c3aed' },
    { label: 'Classes',       count: classes,      icon: Dumbbell,      href: '/admin/classes',      color: '#E8192C' },
    { label: 'Trainers',      count: trainers,     icon: Users,         href: '/admin/trainers',     color: '#14b8a6' },
    { label: 'Pricing Plans', count: pricing,      icon: CreditCard,    href: '/admin/pricing',      color: '#f59e0b' },
    { label: 'Testimonials',  count: testimonials, icon: MessageSquare, href: '/admin/testimonials', color: '#3b82f6' },
    { label: 'Stats',         count: stats,        icon: BarChart2,     href: '/admin/stats',        color: '#10b981' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Dashboard</h1>
        <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">Tổng quan nội dung website</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, count, icon: Icon, href, color }) => (
          <a key={label} href={href}
            className="bg-[#0f1e35] border border-white/8 p-6 hover:border-white/20 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="font-['Barlow_Condensed'] font-black text-3xl text-white">{count}</span>
            </div>
            <p className="font-['DM_Sans'] text-sm text-white/50 group-hover:text-white/70 transition-colors uppercase tracking-wider">{label}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 bg-[#0f1e35] border border-white/8 p-6">
        <h2 className="font-['Barlow_Condensed'] font-bold text-xl uppercase text-white mb-4">Quản lý nhanh</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/admin/hero',    label: 'Chỉnh sửa Hero Section' },
            { href: '/admin/contact', label: 'Cập nhật thông tin liên hệ' },
            { href: '/admin/stats',   label: 'Cập nhật chỉ số thống kê' },
          ].map(item => (
            <a key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-3 border border-white/8 hover:border-[#E8192C]/40 hover:bg-[#E8192C]/5 transition-all font-['DM_Sans'] text-sm text-white/60 hover:text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8192C]" />
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
