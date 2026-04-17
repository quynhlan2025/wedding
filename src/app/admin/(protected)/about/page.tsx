'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '../../_components/ImageUpload';

type AboutForm = {
  title: string;
  description: string;
  years_experience: string;
  features: string[];
  main_image_url: string;
  secondary_image_url: string;
};

const defaults: AboutForm = {
  title: '',
  description: '',
  years_experience: '',
  features: [],
  main_image_url: '',
  secondary_image_url: '',
};

export default function AboutPage() {
  const supabase = createClient();
  const [form, setForm] = useState<AboutForm>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    supabase.from('about_content').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setForm({
          title: data.title,
          description: data.description,
          years_experience: data.years_experience,
          features: data.features ?? [],
          main_image_url: data.main_image_url,
          secondary_image_url: data.secondary_image_url,
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('about_content').upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setForm(f => ({ ...f, features: [...f.features, trimmed] }));
    setNewFeature('');
  };

  const removeFeature = (i: number) => {
    setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  };

  const textField = (key: keyof Pick<AboutForm, 'title' | 'description' | 'years_experience'>, label: string, multiline = false) => (
    <div key={key}>
      <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">{label}</label>
      {multiline ? (
        <textarea rows={4} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
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
        <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">About Section</h1>
        <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">Chỉnh sửa nội dung phần Giới thiệu</p>
      </div>

      {loading ? (
        <div className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-[#0f1e35] border border-white/8 p-6 space-y-6">
          {textField('title', 'Tiêu đề')}
          {textField('description', 'Mô tả', true)}
          {textField('years_experience', 'Số năm kinh nghiệm (vd: 8+)')}

          {/* Features */}
          <div>
            <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">
              Điểm nổi bật
            </label>
            <div className="space-y-2 mb-3">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#04080f] border border-white/10 px-3 py-2">
                  <span className="flex-1 font-['DM_Sans'] text-sm text-white/80">{f}</span>
                  <button type="button" onClick={() => removeFeature(i)}
                    className="text-white/30 hover:text-[#E8192C] transition-colors cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                placeholder="Thêm điểm nổi bật..."
                className="flex-1 bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-4 py-2.5 outline-none transition-colors"
              />
              <button type="button" onClick={addFeature}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-[#E8192C]/20 border border-white/10 hover:border-[#E8192C]/40 text-white/60 hover:text-[#E8192C] font-['DM_Sans'] text-sm px-4 py-2.5 transition-colors cursor-pointer">
                <Plus size={14} /> Thêm
              </button>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Ảnh chính</label>
            <ImageUpload
              value={form.main_image_url}
              onChange={(url: string) => setForm(f => ({ ...f, main_image_url: url }))}
              folder="about"
            />
          </div>
          <div>
            <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Ảnh phụ (góc dưới phải)</label>
            <ImageUpload
              value={form.secondary_image_url}
              onChange={(url: string) => setForm(f => ({ ...f, secondary_image_url: url }))}
              folder="about"
            />
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#c4152a] disabled:opacity-50 text-white font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest px-8 py-3 transition-colors cursor-pointer">
            <Save size={16} />
            {saved ? 'Đã lưu!' : saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      )}
    </div>
  );
}
