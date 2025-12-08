'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
    >
      退出登录
    </button>
  );
}