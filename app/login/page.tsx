"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    if (data.user) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <PageLayout
        title="用户登录"
        description="登录您的账户以访问个人中心"
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
            name: '登录',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            ),
          },
        ]}
      >
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="w-full max-w-md">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8">
              {/* 欢迎标题 */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3">欢迎回来！</h1>
                <p className="text-gray-400">
                  请输入您的凭据以访问您的账户
                </p>
              </div>

              {/* 表单 */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* 错误提示 */}
                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Email 输入框 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                    邮箱地址
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入您的邮箱"
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Password 输入框 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      密码
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      忘记密码？
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入您的密码"
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Remember me 复选框 */}
                <div className="flex items-center gap-3">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-300">
                    记住我30天
                  </label>
                </div>

                {/* Login 按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "登录中..." : "登录"}
                </button>

                {/* 分隔线 */}
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-gray-600"></div>
                  <span className="flex-shrink mx-4 text-sm text-gray-400 bg-gray-800 px-3">
                    或者
                  </span>
                  <div className="flex-grow border-t border-gray-600"></div>
                </div>

                {/* 第三方登录按钮 */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200"
                  >
                    <span className="text-blue-400">🔵</span>
                    使用谷歌登录
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200"
                  >
                    <span className="text-gray-300">🍎</span>
                    使用苹果登录
                  </button>
                </div>

                {/* 注册链接 */}
                <div className="text-center pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    还没有账户？{" "}
                    <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      立即注册
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
