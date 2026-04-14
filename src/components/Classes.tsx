'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, Users, Flame, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const categories = ['Tất Cả', 'Gym', 'Yoga', 'Cardio', 'Đặc Biệt'];

const classes = [
  {
    category: 'Gym',
    name: 'Power Lifting',
    desc: 'Tăng cơ bắp và sức mạnh tổng thể với phương pháp tập luyện chuyên nghiệp.',
    duration: '60 phút',
    level: 'Nâng cao',
    calories: '400-600',
    color: 'from-[#E8192C]/20 to-transparent',
    icon: '🏋️',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=70&auto=format&fit=crop',
  },
  {
    category: 'Yoga',
    name: 'Hatha Yoga',
    desc: 'Cân bằng cơ thể và tâm trí qua các tư thế yoga cổ điển và hơi thở sâu.',
    duration: '75 phút',
    level: 'Cơ bản',
    calories: '150-250',
    color: 'from-purple-500/20 to-transparent',
    icon: '🧘',
    img: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=70&auto=format&fit=crop',
  },
  {
    category: 'Cardio',
    name: 'HIIT Cardio',
    desc: 'Đốt cháy mỡ thừa cực hiệu quả với bài tập cường độ cao xen kẽ nghỉ ngắn.',
    duration: '45 phút',
    level: 'Trung bình',
    calories: '500-700',
    color: 'from-orange-500/20 to-transparent',
    icon: '🔥',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=70&auto=format&fit=crop',
  },
  {
    category: 'Yoga',
    name: 'Vinyasa Flow',
    desc: 'Kết hợp động tác linh hoạt và hơi thở tạo nên dòng chảy thiền định.',
    duration: '60 phút',
    level: 'Trung bình',
    calories: '200-350',
    color: 'from-teal-500/20 to-transparent',
    icon: '🌊',
    img: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&q=70&auto=format&fit=crop',
  },
  {
    category: 'Đặc Biệt',
    name: 'Boxing Fitness',
    desc: 'Phối hợp kỹ năng boxing với cardio để tăng sức mạnh và phản xạ.',
    duration: '60 phút',
    level: 'Trung bình',
    calories: '600-800',
    color: 'from-yellow-500/20 to-transparent',
    icon: '🥊',
    img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=70&auto=format&fit=crop',
  },
  {
    category: 'Gym',
    name: 'Body Sculpt',
    desc: 'Tạo hình vóc dáng lý tưởng với bài tập kết hợp tạ và tự trọng lượng.',
    duration: '50 phút',
    level: 'Cơ bản',
    calories: '300-450',
    color: 'from-[#E8192C]/20 to-transparent',
    icon: '💪',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=70&auto=format&fit=crop',
  },
];

export default function Classes() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState('Tất Cả');

  const filtered = active === 'Tất Cả' ? classes : classes.filter(c => c.category === active);

  return (
    <section id="classes" ref={ref} className="relative py-32 bg-[#060e1c]/50 overflow-hidden">
      <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-[#E8192C]/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 border border-[#E8192C]/40 px-4 py-1.5 mb-6">
              <span className="font-['DM_Sans'] text-xs font-medium uppercase tracking-[0.2em] text-[#E8192C]">
                Chương Trình
              </span>
            </div>
            <h2 className="font-['Barlow_Condensed'] font-black text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] text-white">
              Lớp Học<br/>
              <span className="text-[#E8192C]">Của Chúng Tôi</span>
            </h2>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest px-5 py-2 border transition-all duration-200 ${
                  active === cat
                    ? 'bg-[#E8192C] border-[#E8192C] text-white'
                    : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cls, i) => (
            <motion.div
              key={cls.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
              className="card-hover group relative bg-[#0f1e35] border border-white/8 overflow-hidden"
            >
              {/* Color gradient top */}
              <div className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b ${cls.color} opacity-60 pointer-events-none`} />

              {/* Card image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={cls.img}
                  alt={cls.name}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e35] via-[#0f1e35]/40 to-transparent" />
                <span className="absolute bottom-4 left-4 text-3xl">{cls.icon}</span>
              </div>

              <div className="relative p-8">
                {/* Icon + category */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-['DM_Sans'] text-xs text-[#E8192C] uppercase tracking-widest border border-[#E8192C]/30 px-3 py-1">
                    {cls.category}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-['Barlow_Condensed'] font-bold text-3xl uppercase text-white mb-3 group-hover:text-[#E8192C] transition-colors duration-300">
                  {cls.name}
                </h3>

                {/* Desc */}
                <p className="font-['DM_Sans'] text-sm text-white/50 leading-relaxed mb-6">
                  {cls.desc}
                </p>

                {/* Red line */}
                <div className="w-12 h-px bg-[#E8192C] mb-6 group-hover:w-full transition-all duration-500" />

                {/* Meta */}
                <div className="flex items-center gap-4 text-white/40 text-xs font-['DM_Sans']">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {cls.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={12} />
                    {cls.level}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Flame size={12} />
                    {cls.calories} kcal
                  </span>
                </div>

                {/* Arrow */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute bottom-6 right-6 w-10 h-10 bg-[#E8192C] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ArrowRight size={16} className="text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="text-center mt-12"
        >
          <p className="font-['DM_Sans'] text-white/40 mb-4">Còn nhiều lớp học khác đang chờ bạn</p>
          <button
            onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest text-[#E8192C] border border-[#E8192C]/40 px-10 py-3 hover:bg-[#E8192C] hover:text-white transition-all duration-300"
          >
            Xem Toàn Bộ Lịch
          </button>
        </motion.div>
      </div>
    </section>
  );
}
