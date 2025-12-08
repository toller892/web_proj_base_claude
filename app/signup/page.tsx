"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setError("请同意服务条款和隐私政策");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      // 插入用户数据到 users 表
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: name,
      });

      if (insertError) {
        console.error("Error inserting user:", insertError);
      }

      alert("注册成功！请检查您的邮箱以验证账户。");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <PageLayout
        title="用户注册"
        description="创建新账户以享受完整服务"
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
            name: '注册',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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
                <h1 className="text-3xl font-bold mb-3">开始使用</h1>
                <p className="text-gray-400">
                  创建您的账户以享受完整服务
                </p>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSignUp} className="space-y-6">
                {/* 错误提示 */}
                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Name 输入框 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
                    姓名
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入您的姓名"
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

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
                  <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">
                    密码
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入您的密码（至少6位）"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 条款复选框 */}
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-2 mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    我同意{" "}
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                      服务条款
                    </Link>{" "}
                    和{" "}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                      隐私政策
                    </Link>
                  </label>
                </div>

                {/* Signup 按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "注册中..." : "注册账户"}
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
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200"
                  >
                    <span className="text-blue-400">🔵</span>
                    使用谷歌注册
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200"
                  >
                    <span className="text-gray-300">🍎</span>
                    使用苹果注册
                  </button>
                </div>

                {/* 登录链接 */}
                <div className="text-center pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    已有账户？{" "}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      立即登录
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
