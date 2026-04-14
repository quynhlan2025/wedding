'use client';

import { motion } from 'framer-motion';

const items = [
  'Gym', 'Yoga', 'Strength', 'Cardio', 'CrossFit', 'Pilates',
  'Meditation', 'Nutrition', 'Recovery', 'HIIT', 'Zumba', 'Boxing',
];

export default function MarqueeBanner() {
  return (
    <div className="relative py-4 bg-[#E8192C] overflow-hidden">
      <div className="flex whitespace-nowrap">
        <div className="marquee-track flex">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="font-['Barlow_Condensed'] font-bold text-xl uppercase text-white tracking-widest mx-8 flex items-center gap-4"
            >
              {item}
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
            </span>
          ))}
        </div>
        <div className="marquee-track flex" aria-hidden>
          {[...items, ...items].map((item, i) => (
            <span
              key={`b-${i}`}
              className="font-['Barlow_Condensed'] font-bold text-xl uppercase text-white tracking-widest mx-8 flex items-center gap-4"
            >
              {item}
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
