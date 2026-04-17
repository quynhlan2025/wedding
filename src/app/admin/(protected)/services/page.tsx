'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AdminModal from '../../_components/AdminModal';
import ImageUpload from '../../_components/ImageUpload';

type Service = { id: string; name: string; description: string; image_url: string; sort_order: number };
const empty = (): Omit<Service, 'id'> => ({ name: '', description: '', image_url: '', sort_order: 0 });

export default function ServicesPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Service | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(empty()); setModal({ open: true, editing: null }); };
  const openEdit = (item: Service) => {
    setForm({ name: item.name, description: item.description, image_url: item.image_url, sort_order: item.sort_order });
    setModal({ open: true, editing: item });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (modal.editing) {
      await supabase.from('services').update(form).eq('id', modal.editing.id);
    } else {
      await supabase.from('services').insert(form);
    }
    setSaving(false);
    setModal({ open: false, editing: null });
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá service này?')) return;
    await supabase.from('services').delete().eq('id', id);
    fetch();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Services</h1>
          <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">{items.length} dịch vụ</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#c4152a] text-white font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest px-5 py-2.5 transition-colors">
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      {loading ? <p className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</p> : (
        <div className="space-y-2">
          {items.length === 0 && <p className="font-['DM_Sans'] text-sm text-white/30 py-8 text-center">Chưa có service nào.</p>}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-[#0f1e35] border border-white/8 px-5 py-4">
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover border border-white/10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-['Barlow_Condensed'] font-bold text-lg uppercase text-white">{item.name}</p>
                <p className="font-['DM_Sans'] text-xs text-white/40 truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 text-white/40 hover:text-white transition-colors"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-white/40 hover:text-[#E8192C] transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <AdminModal title={modal.editing ? 'Sửa Service' : 'Thêm Service'} onClose={() => setModal({ open: false, editing: null })}>
          <form onSubmit={handleSave} className="space-y-4">
            {(['name', 'description'] as const).map(k => (
              <div key={k}>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">
                  {k === 'name' ? 'Tên dịch vụ' : 'Mô tả'}
                </label>
                {k === 'description' ? (
                  <textarea rows={3} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors resize-none" />
                ) : (
                  <input type="text" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors" />
                )}
              </div>
            ))}
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Ảnh</label>
              <ImageUpload value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} folder="services" />
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Thứ tự</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))}
                className="w-24 bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors" />
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
