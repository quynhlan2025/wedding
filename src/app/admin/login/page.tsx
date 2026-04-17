'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'forgot' | 'forgot-sent';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${siteUrl}/admin/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setMode('forgot-sent');
    }
  };

  return (
    <div className="admin-panel min-h-screen bg-[#04080f] flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#E8192C]/8 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E8192C]/15 border border-[#E8192C]/30 mb-4">
            <Layers size={24} className="text-[#E8192C]" />
          </div>
          <h1 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-white">Admin Panel</h1>
          <p className="font-['DM_Sans'] text-sm text-white/40 mt-1">CLB GYM Mạnh Cường</p>
        </div>

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="bg-[#0f1e35] border border-white/8 p-8 space-y-5">
            {error && (
              <div className="bg-[#E8192C]/10 border border-[#E8192C]/30 px-4 py-3 font-['DM_Sans'] text-sm text-[#E8192C]">
                {error}
              </div>
            )}
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors" />
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-4 py-3 pr-12 outline-none transition-colors" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#E8192C] hover:bg-[#c4152a] disabled:opacity-50 cursor-pointer text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest py-3.5 transition-colors">
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
            <button type="button" onClick={() => { setMode('forgot'); setForgotEmail(email); }}
              className="w-full text-center font-['DM_Sans'] text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer pt-1">
              Quên mật khẩu?
            </button>
          </form>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="bg-[#0f1e35] border border-white/8 p-8 space-y-5">
            <button type="button" onClick={() => { setMode('login'); setError(''); }}
              className="flex items-center gap-2 font-['DM_Sans'] text-xs text-white/40 hover:text-white transition-colors cursor-pointer mb-2">
              <ArrowLeft size={13} /> Quay lại
            </button>
            {error && (
              <div className="bg-[#E8192C]/10 border border-[#E8192C]/30 px-4 py-3 font-['DM_Sans'] text-sm text-[#E8192C]">
                {error}
              </div>
            )}
            <div>
              <p className="font-['Barlow_Condensed'] font-bold text-xl uppercase text-white mb-1">Quên mật khẩu</p>
              <p className="font-['DM_Sans'] text-xs text-white/40">Nhập email để nhận link đặt lại mật khẩu.</p>
            </div>
            <div>
              <label className="block font-['DM_Sans'] text-xs uppercase tracking-wider text-white/50 mb-2">Email</label>
              <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-sm px-4 py-3 outline-none transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#E8192C] hover:bg-[#c4152a] disabled:opacity-50 cursor-pointer text-white font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-widest py-3.5 transition-colors">
              {loading ? 'Đang gửi...' : 'Gửi Link Reset'}
            </button>
          </form>
        )}

        {/* ── EMAIL SENT ── */}
        {mode === 'forgot-sent' && (
          <div className="bg-[#0f1e35] border border-white/8 p-8 text-center space-y-4">
            <CheckCircle size={40} className="text-green-500 mx-auto" />
            <p className="font-['Barlow_Condensed'] font-bold text-xl uppercase text-white">Đã gửi email!</p>
            <p className="font-['DM_Sans'] text-sm text-white/50">
              Kiểm tra hộp thư <span className="text-white">{forgotEmail}</span> và click link trong email.
            </p>
            <button type="button" onClick={() => setMode('login')}
              className="font-['DM_Sans'] text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
              Quay lại đăng nhập
            </button>
          </div>
        )}

        <p className="text-center font-['DM_Sans'] text-xs text-white/20 mt-6">
          Trang quản trị dành riêng cho admin
        </p>
      </div>
    </div>
  );
}
