'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AdminModal from '../../_components/AdminModal';
import ImageUpload from '../../_components/ImageUpload';

type Trainer = {
  id: string; name: string; role: string; photo_url: string;
  specialty: string; experience: string; certification: string; color: string; sort_order: number;
};
const empty = (): Omit<Trainer, 'id'> => ({
  name: '', role: '', photo_url: '', specialty: '',
  experience: '', certification: '', color: '#E8192C', sort_order: 0,
});

const inp = "w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors";

export default function TrainersPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Trainer | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('trainers').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(empty()); setModal({ open: true, editing: null }); };
  const openEdit = (item: Trainer) => {
    const { id, ...rest } = item;
    setForm(rest);
    setModal({ open: true, editing: item });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (modal.editing) {
      await supabase.from('trainers').update(form).eq('id', modal.editing.id);
    } else {
      await supabase.from('trainers').insert(form);
    }
    setSaving(false);
    setModal({ open: false, editing: null });
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá huấn luyện viên này?')) return;
    await supabase.from('trainers').delete().eq('id', id);
    fetch();
  };

  const set = (k: keyof Omit<Trainer, 'id'>, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Trainers</h1>
          <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">{items.length} huấn luyện viên</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#c4152a] text-white font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest px-5 py-2.5 transition-colors">
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      {loading ? <p className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.length === 0 && <p className="col-span-4 font-['DM_Sans'] text-sm text-white/30 py-8 text-center">Chưa có HLV nào.</p>}
          {items.map(item => (
            <div key={item.id} className="bg-[#0f1e35] border border-white/8 overflow-hidden">
              <div className="relative h-48">
                {item.photo_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full bg-[#060e1c] flex items-center justify-center">
                      <span className="font-['Barlow_Condensed'] font-black text-4xl text-white/20">{item.name[0]}</span>
                    </div>}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e35] to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-['Barlow_Condensed'] font-bold text-xl uppercase text-white">{item.name}</h3>
                <p className="font-['DM_Sans'] text-xs mt-0.5 mb-1" style={{ color: item.color }}>{item.role}</p>
                <p className="font-['DM_Sans'] text-xs text-white/30 mb-3">{item.specialty}</p>
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
        <AdminModal title={modal.editing ? 'Sửa HLV' : 'Thêm HLV'} onClose={() => setModal({ open: false, editing: null })}>
          <form onSubmit={handleSave} className="space-y-4">
            {([
              ['name', 'Tên'],
              ['role', 'Chức danh'],
              ['specialty', 'Chuyên môn'],
              ['experience', 'Kinh nghiệm'],
              ['certification', 'Chứng chỉ'],
            ] as const).map(([k, label]) => (
              <div key={k}>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">{label}</label>
                <input type="text" value={form[k]} onChange={e => set(k, e.target.value)} className={inp} />
              </div>
            ))}
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Ảnh HLV</label>
              <ImageUpload value={form.photo_url} onChange={url => set('photo_url', url)} folder="trainers" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Màu accent</label>
                <div className="flex gap-2">
                  <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="w-10 h-10 bg-transparent border border-white/10 cursor-pointer" />
                  <input type="text" value={form.color} onChange={e => set('color', e.target.value)} className={`flex-1 ${inp}`} />
                </div>
              </div>
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Thứ tự</label>
                <input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors" />
              </div>
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
