'use client';

import { motion } from 'framer-motion';
import { Share2, Globe, Tv, X } from 'lucide-react';

const links = {
  'Công Ty': ['Về Chúng Tôi', 'Đội Ngũ', 'Blog', 'Tuyển Dụng'],
  'Dịch Vụ': ['Gym', 'Yoga', 'PT Cá Nhân', 'Dinh Dưỡng'],
  'Hỗ Trợ': ['FAQ', 'Liên Hệ', 'Điều Khoản', 'Bảo Mật'],
};

const socials = [
  { Icon: Share2, href: '#' },
  { Icon: Globe, href: '#' },
  { Icon: Tv, href: '#' },
  { Icon: X, href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#04080f] border-t border-white/5 overflow-hidden">
      {/* Red top line */}
      <div className="red-line" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#E8192C] flex items-center justify-center">
                <span className="font-['Barlow_Condensed'] font-black text-white text-lg">MC</span>
              </div>
              <span className="font-['Barlow_Condensed'] font-bold text-white text-2xl tracking-wider uppercase">
                Mạnh<span className="text-[#E8192C]">Cường</span>
              </span>
            </div>
            <p className="font-['DM_Sans'] text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              CLB GYM Mạnh Cường — nơi rèn luyện thể lực và ý chí. Mỗi ngày tập là một bước tiến tới phiên bản tốt hơn của bạn.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 border border-white/10 hover:border-[#E8192C] flex items-center justify-center text-white/40 hover:text-[#E8192C] transition-colors duration-200"
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest text-white mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-['DM_Sans'] text-sm text-white/40 hover:text-white transition-colors duration-200 animated-underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-['DM_Sans'] text-xs text-white/25">
            © 2024 CLB GYM Mạnh Cường. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-['DM_Sans'] text-xs text-white/25 hover:text-white/50 transition-colors">Điều Khoản</a>
            <a href="#" className="font-['DM_Sans'] text-xs text-white/25 hover:text-white/50 transition-colors">Bảo Mật</a>
            <a href="#" className="font-['DM_Sans'] text-xs text-white/25 hover:text-white/50 transition-colors">Cookie</a>
          </div>
        </div>
      </div>

      {/* Large background text */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none">
        <div className="font-['Barlow_Condensed'] font-black text-[12vw] text-white/[0.02] uppercase leading-none text-center">
          MẠNH CƯỜNG GYM
        </div>
      </div>
    </footer>
  );
}
