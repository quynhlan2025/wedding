'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AdminModal from '../../_components/AdminModal';

type Plan = {
  id: string; name: string; price: string; period: string; description: string;
  popular: boolean; color: string; features: string[]; not_included: string[]; sort_order: number;
};
const empty = (): Omit<Plan, 'id'> => ({
  name: '', price: '', period: '/tháng', description: '',
  popular: false, color: '#ffffff', features: [], not_included: [], sort_order: 0,
});

const inp = "w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors";

function TagsInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  };
  return (
    <div>
      <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(v => (
          <span key={v} className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 text-xs font-['DM_Sans'] text-white/70">
            {v}
            <button type="button" onClick={() => onChange(value.filter(x => x !== v))} className="text-white/30 hover:text-[#E8192C]"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Nhập và nhấn Enter..."
          className="flex-1 bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white font-['DM_Sans'] text-sm px-4 py-2 outline-none transition-colors" />
        <button type="button" onClick={add} className="px-3 py-2 bg-white/5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white text-xs font-['DM_Sans'] transition-colors">Thêm</button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Plan | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('pricing_plans').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(empty()); setModal({ open: true, editing: null }); };
  const openEdit = (item: Plan) => {
    const { id, ...rest } = item;
    setForm({ ...rest, features: rest.features ?? [], not_included: rest.not_included ?? [] });
    setModal({ open: true, editing: item });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (modal.editing) {
      await supabase.from('pricing_plans').update(form).eq('id', modal.editing.id);
    } else {
      await supabase.from('pricing_plans').insert(form);
    }
    setSaving(false);
    setModal({ open: false, editing: null });
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá gói này?')) return;
    await supabase.from('pricing_plans').delete().eq('id', id);
    fetch();
  };

  const set = <K extends keyof Omit<Plan, 'id'>>(k: K, v: Plan[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Pricing Plans</h1>
          <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">{items.length} gói hội viên</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#c4152a] text-white font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-widest px-5 py-2.5 transition-colors">
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      {loading ? <p className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</p> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 && <p className="col-span-3 font-['DM_Sans'] text-sm text-white/30 py-8 text-center">Chưa có gói nào.</p>}
          {items.map(item => (
            <div key={item.id} className={`bg-[#0f1e35] border overflow-hidden ${item.popular ? 'border-[#E8192C]' : 'border-white/8'}`}>
              {item.popular && <div className="bg-[#E8192C] py-1.5 text-center font-['Barlow_Condensed'] font-bold text-xs uppercase tracking-widest text-white">Phổ Biến Nhất</div>}
              <div className="p-5">
                <h3 className="font-['Barlow_Condensed'] font-bold text-2xl uppercase text-white">{item.name}</h3>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-white/40 text-sm">₫</span>
                  <span className="font-['Barlow_Condensed'] font-black text-4xl" style={{ color: item.color }}>{item.price}</span>
                  <span className="text-white/40 text-xs">{item.period}</span>
                </div>
                <p className="font-['DM_Sans'] text-xs text-white/40 mb-3">{item.description}</p>
                <div className="space-y-1 mb-4">
                  {(item.features ?? []).map(f => (
                    <p key={f} className="font-['DM_Sans'] text-xs text-white/60">✓ {f}</p>
                  ))}
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
        <AdminModal title={modal.editing ? 'Sửa gói' : 'Thêm gói'} onClose={() => setModal({ open: false, editing: null })}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Tên gói</label>
              <input required type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Giá (₫)</label>
                <input type="text" value={form.price} onChange={e => set('price', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Kỳ hạn</label>
                <input type="text" value={form.period} onChange={e => set('period', e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Mô tả ngắn</label>
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)} className={inp} />
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
                <input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} className={inp} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="popular" checked={form.popular} onChange={e => set('popular', e.target.checked)}
                className="w-4 h-4 accent-[#E8192C]" />
              <label htmlFor="popular" className="font-['DM_Sans'] text-sm text-white/60">Phổ biến nhất</label>
            </div>
            <TagsInput label="Tính năng bao gồm" value={form.features} onChange={v => set('features', v)} />
            <TagsInput label="Không bao gồm" value={form.not_included} onChange={v => set('not_included', v)} />
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
