import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <PageLayout
        title="用户中心"
        description="管理您的账户信息和购买记录"
        breadcrumbItems={[
          {
            name: '首页',
            href: '/',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ),
          },
          {
            name: '用户中心',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
        ]}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">个人中心</h1>
              <SignOutButton />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400">邮箱地址</p>
                <p className="font-medium text-white">{user.email}</p>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400">用户 ID</p>
                <p className="font-mono text-sm text-green-400">{user.id}</p>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400">注册时间</p>
                <p className="font-medium text-white">
                  {new Date(user.created_at).toLocaleString('zh-CN')}
                </p>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400">最近登录</p>
                <p className="font-medium text-white">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('zh-CN') : '未知'}
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-green-900/50 border border-green-700 rounded-lg">
              <h2 className="text-xl font-bold text-green-400 mb-2">
                🎉 登录成功！
              </h2>
              <p className="text-green-300">
                您已成功使用 Supabase Auth 登录。这是您的个人 Dashboard。
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-6 text-center hover:bg-gray-650 transition-colors duration-200">
                <div className="text-3xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold mb-2">购买记录</h3>
                <p className="text-gray-400 text-sm">查看您的所有购买历史</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-6 text-center hover:bg-gray-650 transition-colors duration-200">
                <div className="text-3xl mb-4">⚙️</div>
                <h3 className="text-lg font-semibold mb-2">账户设置</h3>
                <p className="text-gray-400 text-sm">管理您的个人偏好设置</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
