'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AdminModal from '../../_components/AdminModal';
import ImageUpload from '../../_components/ImageUpload';

type Class = {
  id: string; category: string; name: string; description: string;
  duration: string; level: string; calories: string; icon: string; image_url: string; sort_order: number;
};
const empty = (): Omit<Class, 'id'> => ({
  category: 'Gym', name: '', description: '', duration: '60 phút',
  level: 'Cơ bản', calories: '300-500', icon: '🏋️', image_url: '', sort_order: 0,
});

const CATEGORIES = ['Gym', 'Yoga', 'Cardio', 'Đặc Biệt'];
const LEVELS = ['Cơ bản', 'Trung bình', 'Nâng cao'];

const inp = 'w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-[\'DM_Sans\'] text-sm px-4 py-3 outline-none transition-colors';

export default function ClassesPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Class | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('classes').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(empty()); setModal({ open: true, editing: null }); };
  const openEdit = (item: Class) => {
    const { id, ...rest } = item;
    setForm(rest);
    setModal({ open: true, editing: item });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (modal.editing) {
      await supabase.from('classes').update(form).eq('id', modal.editing.id);
    } else {
      await supabase.from('classes').insert(form);
    }
    setSaving(false);
    setModal({ open: false, editing: null });
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá lớp học này?')) return;
    await supabase.from('classes').delete().eq('id', id);
    fetch();
  };

  const set = (k: keyof Omit<Class, 'id'>, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Classes</h1>
          <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">{items.length} lớp học</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#c4152a] text-white font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest px-5 py-2.5 transition-colors">
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      {loading ? <p className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</p> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 && <p className="col-span-3 font-['DM_Sans'] text-sm text-white/30 py-8 text-center">Chưa có lớp học nào.</p>}
          {items.map(item => (
            <div key={item.id} className="bg-[#0f1e35] border border-white/8">
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-['DM_Sans'] text-[10px] uppercase tracking-widest text-[#E8192C] border border-[#E8192C]/30 px-2 py-0.5">{item.category}</span>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <h3 className="font-['Barlow_Condensed'] font-bold text-xl uppercase text-white mb-1">{item.name}</h3>
                <p className="font-['DM_Sans'] text-xs text-white/40 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex gap-3 font-['DM_Sans'] text-xs text-white/30 mb-3">
                  <span>{item.duration}</span>
                  <span>·</span><span>{item.level}</span>
                  <span>·</span><span>{item.calories} kcal</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white py-1.5 text-xs font-['DM_Sans'] transition-colors">
                    <Pencil size={12} /> Sửa
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 hover:border-[#E8192C]/50 text-white/50 hover:text-[#E8192C] py-1.5 text-xs font-['DM_Sans'] transition-colors">
                    <Trash2 size={12} /> Xoá
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <AdminModal title={modal.editing ? 'Sửa lớp học' : 'Thêm lớp học'} onClose={() => setModal({ open: false, editing: null })}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Danh mục</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Cấp độ</label>
                <select value={form.level} onChange={e => set('level', e.target.value)}
                  className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors">
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Tên lớp</label>
              <input required type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Mô tả</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {([['duration', 'Thời lượng'], ['calories', 'Calories'], ['icon', 'Icon']] as const).map(([k, label]) => (
                <div key={k}>
                  <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">{label}</label>
                  <input type="text" value={form[k]} onChange={e => set(k, e.target.value)} className={inp} />
                </div>
              ))}
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Ảnh</label>
              <ImageUpload value={form.image_url} onChange={(url: string) => set('image_url', url)} folder="classes" />
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
