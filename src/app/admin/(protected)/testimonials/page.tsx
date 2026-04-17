'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AdminModal from '../../_components/AdminModal';

type Testimonial = {
  id: string; name: string; role: string; quote: string;
  stars: number; months: string; initials: string; sort_order: number;
};
const empty = (): Omit<Testimonial, 'id'> => ({
  name: '', role: '', quote: '', stars: 5, months: '', initials: '', sort_order: 0,
});

const inp = "w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors";

export default function TestimonialsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Testimonial | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(empty()); setModal({ open: true, editing: null }); };
  const openEdit = (item: Testimonial) => {
    const { id, ...rest } = item;
    setForm(rest);
    setModal({ open: true, editing: item });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (modal.editing) {
      await supabase.from('testimonials').update(form).eq('id', modal.editing.id);
    } else {
      await supabase.from('testimonials').insert(form);
    }
    setSaving(false);
    setModal({ open: false, editing: null });
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá đánh giá này?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    fetch();
  };

  const set = (k: keyof Omit<Testimonial, 'id'>, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Testimonials</h1>
          <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">{items.length} đánh giá</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#c4152a] text-white font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest px-5 py-2.5 transition-colors">
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      {loading ? <p className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</p> : (
        <div className="space-y-3">
          {items.length === 0 && <p className="font-['DM_Sans'] text-sm text-white/30 py-8 text-center">Chưa có đánh giá nào.</p>}
          {items.map(item => (
            <div key={item.id} className="flex gap-4 bg-[#0f1e35] border border-white/8 p-5">
              <div className="w-10 h-10 shrink-0 bg-[#E8192C]/20 border border-[#E8192C]/30 flex items-center justify-center">
                <span className="font-['Barlow_Condensed'] font-bold text-[#E8192C]">{item.initials || item.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-['Barlow_Condensed'] font-bold text-white uppercase">{item.name}</span>
                  <span className="font-['DM_Sans'] text-xs text-white/40">{item.role}</span>
                  <div className="flex gap-0.5 ml-auto shrink-0">
                    {Array.from({ length: item.stars }).map((_, i) => <Star key={i} size={10} fill="#E8192C" className="text-[#E8192C]" />)}
                  </div>
                </div>
                <p className="font-['DM_Sans'] text-xs text-white/50 line-clamp-2">"{item.quote}"</p>
                <p className="font-['DM_Sans'] text-xs text-white/30 mt-1">{item.months}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-white/40 hover:text-[#E8192C] transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <AdminModal title={modal.editing ? 'Sửa đánh giá' : 'Thêm đánh giá'} onClose={() => setModal({ open: false, editing: null })}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Họ tên</label>
                <input required type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Chữ viết tắt</label>
                <input type="text" maxLength={3} placeholder="NM" value={form.initials} onChange={e => set('initials', e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Chức danh / Nghề nghiệp</label>
              <input type="text" value={form.role} onChange={e => set('role', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Nội dung đánh giá</label>
              <textarea required rows={4} value={form.quote} onChange={e => set('quote', e.target.value)}
                className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Số sao (1-5)</label>
                <input type="number" min={1} max={5} value={form.stars} onChange={e => set('stars', +e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Thời gian tập</label>
                <input type="text" placeholder="6 tháng" value={form.months} onChange={e => set('months', e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Thứ tự</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} className="w-24 bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-[#E8192C] hover:bg-[#c4152a] disabled:opacity-50 text-white font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest py-3 transition-colors">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
