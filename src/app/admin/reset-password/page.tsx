'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase puts the token in the URL hash — wait for session to be set
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Mật khẩu không khớp.'); return; }
    if (password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự.'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push('/admin/login'), 2500);
    }
  };

  return (
    <div className="admin-panel min-h-screen bg-[#04080f] flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#E8192C]/8 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E8192C]/15 border border-[#E8192C]/30 mb-4">
            <Layers size={24} className="text-[#E8192C]" />
          </div>
          <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Đặt Lại Mật Khẩu</h1>
          <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">CLB GYM Mạnh Cường</p>
        </div>

        {done ? (
          <div className="bg-[#0f1e35] border border-white/8 p-8 text-center space-y-4">
            <CheckCircle size={40} className="text-green-500 mx-auto" />
            <p className="font-['Barlow_Condensed'] font-bold text-xl text-white uppercase">Đổi mật khẩu thành công!</p>
            <p className="font-['DM_Sans'] text-sm text-white/40">Đang chuyển về trang đăng nhập...</p>
          </div>
        ) : !ready ? (
          <div className="bg-[#0f1e35] border border-white/8 p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#E8192C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-['DM_Sans'] text-sm text-white/40">Đang xác thực link...</p>
            <p className="font-['DM_Sans'] text-xs text-white/20 mt-2">Nếu chờ quá lâu, hãy yêu cầu gửi lại email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#0f1e35] border border-white/8 p-8 space-y-5">
            {error && (
              <div className="bg-[#E8192C]/10 border border-[#E8192C]/30 px-4 py-3 font-['DM_Sans'] text-sm text-[#E8192C]">
                {error}
              </div>
            )}

            {[
              { label: 'Mật khẩu mới', value: password, onChange: setPassword },
              { label: 'Xác nhận mật khẩu', value: confirm, onChange: setConfirm },
            ].map(({ label, value, onChange }) => (
              <div key={label}>
                <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">{label}</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} required value={value}
                    onChange={e => onChange(e.target.value)} placeholder="••••••••"
                    className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-4 py-3 pr-12 outline-none transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full bg-[#E8192C] hover:bg-[#c4152a] disabled:opacity-50 cursor-pointer text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest py-3.5 transition-colors">
              {loading ? 'Đang lưu...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
