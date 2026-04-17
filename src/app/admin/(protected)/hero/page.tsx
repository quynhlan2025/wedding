'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '../../_components/ImageUpload';

type HeroContent = {
  headline: string;
  subtext: string;
  bg_image_url: string;
};

const defaults: HeroContent = {
  headline: '',
  subtext: '',
  bg_image_url: '',
};

export default function HeroPage() {
  const supabase = createClient();
  const [form, setForm] = useState<HeroContent>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('hero_content').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setForm({ headline: data.headline, subtext: data.subtext, bg_image_url: data.bg_image_url });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('hero_content').upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const field = (key: keyof HeroContent, label: string, multiline = false) => (
    <div key={key}>
      <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">{label}</label>
      {multiline ? (
        <textarea rows={3} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors resize-none" />
      ) : (
        <input type="text" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors" />
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Hero Section</h1>
        <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">Chỉnh sửa nội dung phần đầu trang</p>
      </div>

      {loading ? (
        <div className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-[#0f1e35] border border-white/8 p-6 space-y-5">
          {field('headline', 'Tiêu đề chính')}
          {field('subtext', 'Mô tả phụ', true)}
          <div>
            <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Ảnh nền</label>
            <ImageUpload
              value={form.bg_image_url}
              onChange={(url: string) => setForm(f => ({ ...f, bg_image_url: url }))}
              folder="hero"
            />
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#c4152a] disabled:opacity-50 text-white font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest px-8 py-3 transition-colors">
            <Save size={16} />
            {saved ? 'Đã lưu!' : saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      )}
    </div>
  );
}
