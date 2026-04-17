'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Stat = { id: string; label: string; value: string; sort_order: number };

export default function StatsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('stats').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const update = (id: string, k: keyof Omit<Stat, 'id'>, v: string | number) =>
    setItems(prev => prev.map(s => s.id === id ? { ...s, [k]: v } : s));

  const addRow = () =>
    setItems(prev => [...prev, { id: `new-${Date.now()}`, label: '', value: '', sort_order: prev.length }]);

  const removeRow = async (item: Stat) => {
    if (!item.id.startsWith('new-')) {
      await supabase.from('stats').delete().eq('id', item.id);
    }
    setItems(prev => prev.filter(s => s.id !== item.id));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const item of items) {
      const { id, ...data } = item;
      if (id.startsWith('new-')) {
        await supabase.from('stats').insert(data);
      } else {
        await supabase.from('stats').update(data).eq('id', id);
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    fetch();
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Stats</h1>
          <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">Các chỉ số thống kê hiển thị trên Hero</p>
        </div>
        <button onClick={addRow}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-['DM_Sans'] text-sm px-4 py-2 transition-colors">
          <Plus size={14} /> Thêm dòng
        </button>
      </div>

      {loading ? <p className="font-['DM_Sans'] text-sm text-white/30">Đang tải...</p> : (
        <div className="bg-[#0f1e35] border border-white/8">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_60px_40px] gap-px bg-white/5 border-b border-white/8">
            {['Nhãn', 'Giá trị', 'Thứ tự', ''].map(h => (
              <div key={h} className="bg-[#0f1e35] px-4 py-2.5 font-['DM_Sans'] text-xs uppercase tracking-wider text-white/30">{h}</div>
            ))}
          </div>
          {items.length === 0 && (
            <p className="font-['DM_Sans'] text-sm text-white/30 p-6 text-center">Chưa có stat nào. Nhấn Thêm dòng.</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_60px_40px] gap-px bg-white/5 border-b border-white/5 last:border-0">
              <div className="bg-[#0f1e35]">
                <input type="text" value={item.label} onChange={e => update(item.id, 'label', e.target.value)}
                  className="w-full bg-transparent px-4 py-3 font-['DM_Sans'] text-sm text-white outline-none focus:bg-white/5 transition-colors" />
              </div>
              <div className="bg-[#0f1e35]">
                <input type="text" value={item.value} onChange={e => update(item.id, 'value', e.target.value)}
                  className="w-full bg-transparent px-4 py-3 font-['DM_Sans'] text-sm text-[#E8192C] font-bold outline-none focus:bg-white/5 transition-colors" />
              </div>
              <div className="bg-[#0f1e35]">
                <input type="number" value={item.sort_order} onChange={e => update(item.id, 'sort_order', +e.target.value)}
                  className="w-full bg-transparent px-3 py-3 font-['DM_Sans'] text-sm text-white/50 outline-none focus:bg-white/5 transition-colors" />
              </div>
              <div className="bg-[#0f1e35] flex items-center justify-center">
                <button onClick={() => removeRow(item)} className="p-1.5 text-white/20 hover:text-[#E8192C] transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <button onClick={handleSave} disabled={saving}
          className="mt-5 flex items-center gap-2 bg-[#E8192C] hover:bg-[#c4152a] disabled:opacity-50 text-white font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-widest px-8 py-3 transition-colors">
          <Save size={16} />
          {saved ? 'Đã lưu!' : saving ? 'Đang lưu...' : 'Lưu tất cả'}
        </button>
      )}
    </div>
  );
}
