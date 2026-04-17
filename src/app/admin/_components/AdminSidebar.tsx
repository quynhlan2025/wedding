'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Image, Layers, Dumbbell, Users,
  CreditCard, MessageSquare, BarChart2, Phone, Briefcase, LogOut, FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const nav = [
  { href: '/admin',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/hero',        label: 'Hero',         icon: Image },
  { href: '/admin/about',       label: 'About',        icon: FileText },
  { href: '/admin/services',    label: 'Services',     icon: Briefcase },
  { href: '/admin/classes',     label: 'Classes',      icon: Dumbbell },
  { href: '/admin/trainers',    label: 'Trainers',     icon: Users },
  { href: '/admin/pricing',     label: 'Pricing',      icon: CreditCard },
  { href: '/admin/testimonials',label: 'Testimonials', icon: MessageSquare },
  { href: '/admin/stats',       label: 'Stats',        icon: BarChart2 },
  { href: '/admin/contact',     label: 'Contact',      icon: Phone },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[#060e1c] border-r border-white/8 flex flex-col z-40">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-[#E8192C]" />
          <span className="font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-wider text-white">
            Admin Panel
          </span>
        </div>
        <p className="font-['DM_Sans'] text-[10px] text-white/30 mt-0.5 uppercase tracking-wider">
          CLB GYM Mạnh Cường
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 font-['DM_Sans'] text-sm transition-colors ${
                active
                  ? 'bg-[#E8192C]/15 text-[#E8192C] border-l-2 border-[#E8192C]'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/8">
        <button onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 font-['DM_Sans'] text-sm text-white/40 hover:text-[#E8192C] hover:bg-[#E8192C]/10 transition-colors border-l-2 border-transparent cursor-pointer">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
