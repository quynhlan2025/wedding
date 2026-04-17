import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '../_components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  return (
    <div className="admin-panel min-h-screen bg-[#04080f]">
      <AdminSidebar />
      <main className="ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
