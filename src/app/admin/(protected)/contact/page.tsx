'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type SocialLink = { platform: string; url: string };
type ContactSettings = {
  address_line1: string; address_line2: string;
  phone: string; email: string;
  hours_weekdays: string; hours_weekend: string;
  social_links: SocialLink[];
};

const defaults: ContactSettings = {
  address_line1: '', address_line2: '', phone: '', email: '',
  hours_weekdays: '', hours_weekend: '', social_links: [],
};

const inp = "w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors";

export default function ContactPage() {
  const supabase = createClient();
  const [form, setForm] = useState<ContactSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('contact_settings').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setForm({
          address_line1: data.address_line1, address_line2: data.address_line2,
          phone: data.phone, email: data.email,
          hours_weekdays: data.hours_weekdays, hours_weekend: data.hours_weekend,
          social_links: data.social_links ?? [],
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('contact_settings').upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (k: keyof ContactSettings, v: string | SocialLink[]) => setForm(f => ({ ...f, [k]: v }));

  const addSocial = () => set('social_links', [...form.social_links, { platform: '', url: '' }]);
  const updateSocial = (i: number, k: keyof SocialLink, v: string) =>
    set('social_links', form.social_links.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  const removeSocial = (i: number) => set('social_links', form.social_links.filter((_, idx) => idx !== i));

  const field = (k: keyof ContactSettings, label: string, type = 'text') => (
    <div key={k}>
      <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">{label}</label>
      <input type={type} value={form[k] as string} onChange={e => set(k, e.target.value)} className={inp} />
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Contact</h1>
        <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">Thông tin liên hệ & mạng xã hội</p>
      </div>

      {loading ? <p className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</p> : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Address */}
          <div className="bg-[#0f1e35] border border-white/8 p-5 space-y-4">
            <h3 className="font-['Barlow_Condensed'] font-bold text-lg uppercase text-white/60">Địa chỉ</h3>
            {field('address_line1', 'Dòng địa chỉ 1')}
            {field('address_line2', 'Dòng địa chỉ 2')}
          </div>

          {/* Contact info */}
          <div className="bg-[#0f1e35] border border-white/8 p-5 space-y-4">
            <h3 className="font-['Barlow_Condensed'] font-bold text-lg uppercase text-white/60">Liên hệ</h3>
            {field('phone', 'Số điện thoại', 'tel')}
            {field('email', 'Email', 'email')}
          </div>

          {/* Hours */}
          <div className="bg-[#0f1e35] border border-white/8 p-5 space-y-4">
            <h3 className="font-['Barlow_Condensed'] font-bold text-lg uppercase text-white/60">Giờ mở cửa</h3>
            {field('hours_weekdays', 'Thứ 2 – 6')}
            {field('hours_weekend', 'Thứ 7 – CN')}
          </div>

          {/* Social links */}
          <div className="bg-[#0f1e35] border border-white/8 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Barlow_Condensed'] font-bold text-lg uppercase text-white/60">Mạng xã hội</h3>
              <button type="button" onClick={addSocial}
                className="flex items-center gap-1.5 text-white/40 hover:text-white font-['DM_Sans'] text-xs transition-colors">
                <Plus size={13} /> Thêm
              </button>
            </div>
            <div className="space-y-3">
              {form.social_links.map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input type="text" placeholder="Facebook" value={s.platform} onChange={e => updateSocial(i, 'platform', e.target.value)}
                    className="w-32 bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-3 py-2.5 outline-none transition-colors" />
                  <input type="url" placeholder="https://..." value={s.url} onChange={e => updateSocial(i, 'url', e.target.value)}
                    className="flex-1 bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-3 py-2.5 outline-none transition-colors" />
                  <button type="button" onClick={() => removeSocial(i)} className="p-2.5 text-white/20 hover:text-[#E8192C] transition-colors"><X size={14} /></button>
                </div>
              ))}
              {form.social_links.length === 0 && (
                <p className="font-['DM_Sans'] text-xs text-white/20">Chưa có link nào.</p>
              )}
            </div>
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
